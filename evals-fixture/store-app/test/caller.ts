import type { Db } from "@/db/types";
import { createCallerFactory, type Session } from "@/lib/trpc/init";
import { appRouter } from "@/lib/trpc/routers/_app";
import { testDb } from "./db";

export const createCaller = createCallerFactory(appRouter);

/** A test context: the session, the database, and where the call-trace block goes. */
export const ctxFor = (session: Session | null, db: Db = testDb, log: (block: string) => void = () => {}) => ({
  db,
  session,
  log,
});
