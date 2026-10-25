import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import * as schema from "./schema";
import { tracedClient } from "./traced-client";
import type { Db } from "./types";

// The app's database. The fixture runs on an in-memory PGlite; a deployed app passes a Postgres client here.
export const db: Db = drizzle(tracedClient(new PGlite()), { schema });
export type { Db };
