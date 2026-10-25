import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import * as schema from "@/db/schema";
import { tracedClient } from "@/db/traced-client";
import type { Db } from "@/db/types";
import { countingLogger } from "./statement-counter";

export const testDb: Db = drizzle(tracedClient(new PGlite()), { schema, logger: countingLogger });

const ROLLBACK = new Error("rollback");

// Runs one test's work in a transaction and discards it, so the next test starts clean.
export async function inRollback(run: (tx: Db) => Promise<void>) {
  await testDb
    .transaction(async (tx) => {
      await run(tx as unknown as Db);
      throw ROLLBACK;
    })
    .catch((error: unknown) => {
      if (error !== ROLLBACK) throw error;
    });
}
