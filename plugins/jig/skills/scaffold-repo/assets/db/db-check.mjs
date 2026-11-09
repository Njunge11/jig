// Proves DATABASE_URL answers one query. `pnpm --filter <scope>/db db:check`
// runs it under dotenv, so it reads the repo root's .env.
import postgres from "postgres";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set. Fill .env from .env.example.");
  process.exit(1);
}
const sql = postgres(url, { max: 1, connect_timeout: 10 });
try {
  const [row] = await sql`select current_database() as db, version() as version`;
  console.log(`db ok: ${row.db} on ${row.version.split(",")[0]}`);
  process.exit(0);
} catch (error) {
  console.error(`db unreachable: ${error.message}`);
  process.exit(1);
} finally {
  await sql.end({ timeout: 1 });
}
