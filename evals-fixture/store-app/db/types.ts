import type { PgliteDatabase } from "drizzle-orm/pglite";
import type * as schema from "./schema";

// The database type the repos take; only the composition root imports the client.
export type Db = PgliteDatabase<typeof schema>;
