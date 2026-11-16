import { execFileSync, spawnSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import {
  appendFileSync,
  chmodSync,
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";

import postgres from "postgres";

// Plain node runs this file (`run.ts`): the import names the full file.
import {
  baseStateDir,
  checkoutKey,
  checkoutKeyOf,
  repoRoot,
  sharedOutputDir,
  stateDir,
} from "./apps.ts";

/**
 * The database of a run: a PostgreSQL server on this machine, with its own
 * data folder and its own port. A run does not use the database of `.env`.
 *
 * Why: the database of `.env` is remote, and each statement of each request
 * of each step pays one round trip to it. Measured on one repo: 188 ms for a
 * statement there and 0.1 ms here.
 *
 * - The data folder is beside the saved sessions, in the main checkout: one
 *   server for each checkout of the repo. `initdb` makes it on the first run
 *   and refuses a folder that holds files (PostgreSQL docs, "Creating a
 *   Database Cluster"). To start from an empty database, delete
 *   `packages/e2e/.output/postgres` of the main checkout and
 *   `packages/e2e/.output/state`.
 * - Each worktree has its own database on that server, and its own saved
 *   sessions. Two builders work in two worktrees at the same time, each on
 *   a schema of its own: with one database, the schema push of one run
 *   removed the tables of the other, or had a question and wrote nothing.
 *   The first run of a worktree copies the database of the main checkout
 *   (`CREATE DATABASE ... TEMPLATE`: PostgreSQL docs, "Template Databases")
 *   and its sessions, so it signs in no person again. The copy needs a
 *   source with no connection: one run is active at a time. A run removes
 *   the database and the sessions of a worktree that git knows no more.
 * - The server listens on the loopback address only, on a port that no
 *   other server uses, and makes no socket file. Each connection gives the
 *   password of the data folder (`--auth=scram-sha-256`: the docs say not to
 *   use the default `trust` unless each local user is trusted).
 * - A run starts the server and stops it at its end. No process stays.
 * - It keeps no data that matters, so it does not wait for the disk: the
 *   settings of the docs' "Non-Durable Settings". A crash of the machine can
 *   damage the data folder: delete it, and the next run makes it again.
 * - It has the major version, the encoding, the locale (ICU, en-US) and the
 *   time zone of the remote database, so a statement answers and sorts here
 *   as it does there.
 */

/** The major version of the remote database (`select version()`): `scaffold-repo` writes it. */
const MAJOR = {{POSTGRES_MAJOR}};
/** Not 5432 (a server of the machine) and not 54322 (the Supabase CLI). */
const PORT = 54329;
/** The role of each connection, and the database of the main checkout. */
const BASE = "e2e";
/** The database of this checkout. */
const NAME = checkoutKey ? `${BASE}_${checkoutKey}` : BASE;

const home = path.join(sharedOutputDir, "postgres");
const dataDir = path.join(home, "data");
const passwordFile = path.join(home, "password");
const serverLog = path.join(home, "server.log");

const SETTINGS = `
# The end-to-end run (packages/e2e/support/test-database.ts).
port = ${PORT}
listen_addresses = '127.0.0.1'
unix_socket_directories = ''
timezone = 'UTC'
log_timezone = 'UTC'
# PostgreSQL docs, "Non-Durable Settings": test data only.
fsync = off
synchronous_commit = off
full_page_writes = off
`;

/** The folder of `initdb` and `pg_ctl` of the major version, or a clear refusal. */
function binDir(): string {
  const folders = [
    process.env.E2E_POSTGRES_BIN,
    `/opt/homebrew/opt/postgresql@${MAJOR}/bin`,
    `/usr/local/opt/postgresql@${MAJOR}/bin`,
    `/Library/PostgreSQL/${MAJOR}/bin`,
    `/usr/lib/postgresql/${MAJOR}/bin`,
  ];
  for (const folder of folders) {
    if (folder && existsSync(path.join(folder, "pg_ctl"))) return folder;
  }
  throw new Error(
    `e2e: PostgreSQL ${MAJOR} is not on this machine. Install it (brew install postgresql@${MAJOR}), or set E2E_POSTGRES_BIN to the folder of pg_ctl.`,
  );
}

function tool(name: string, args: string[]): void {
  execFileSync(path.join(binDir(), name), args, {
    stdio: ["ignore", "ignore", "inherit"],
  });
}

function password(): string {
  return readFileSync(passwordFile, "utf8").trim();
}

function urlOf(database: string): string {
  return `postgres://${BASE}:${password()}@127.0.0.1:${PORT}/${database}`;
}

function makeCluster(): void {
  mkdirSync(home, { recursive: true });
  writeFileSync(passwordFile, `${randomBytes(24).toString("hex")}\n`);
  chmodSync(passwordFile, 0o600);
  tool("initdb", [
    "-D",
    dataDir,
    "-U",
    BASE,
    `--pwfile=${passwordFile}`,
    "--auth=scram-sha-256",
    "--encoding=UTF8",
    "--locale=en_US.UTF-8",
    "--locale-provider=icu",
    "--icu-locale=en-US",
  ]);
  appendFileSync(path.join(dataDir, "postgresql.conf"), SETTINGS);
}

/** `pg_ctl status` answers 0 for a server that runs in the data folder. */
function runs(): boolean {
  const status = spawnSync(
    path.join(binDir(), "pg_ctl"),
    ["status", "-D", dataDir],
    { stdio: "ignore" },
  );
  return status.status === 0;
}

/** `a"b` as `"a""b"`: a name in a statement. */
const quoted = (name: string) => `"${name.replaceAll('"', '""')}"`;

/** The key of each worktree that git knows, the main checkout among them. */
function worktreeKeys(): Set<string> {
  const list = execFileSync("git", ["worktree", "list", "--porcelain"], {
    cwd: repoRoot,
    encoding: "utf8",
  });
  return new Set(
    list
      .split("\n")
      .filter((line) => line.startsWith("worktree "))
      .map((line) => checkoutKeyOf(line.slice("worktree ".length))),
  );
}

/**
 * Makes the database of this checkout when the server has none. A worktree
 * gets a copy of the database of the main checkout and of its sessions. The
 * database and the sessions of a worktree that is gone are removed.
 */
async function makeDatabase(): Promise<void> {
  const sql = postgres(urlOf("postgres"), { max: 1, onnotice: () => {} });
  try {
    const rows = await sql<{ name: string }[]>`
      select datname as name from pg_database`;
    const names = rows.map((row) => row.name);
    if (!names.includes(BASE)) await sql.unsafe(`create database ${BASE}`);

    const live = worktreeKeys();
    for (const name of names) {
      if (!name.startsWith(`${BASE}_`)) continue;
      const key = name.slice(BASE.length + 1);
      if (live.has(key)) continue;
      await sql.unsafe(`drop database if exists ${quoted(name)}`);
      rmSync(path.join(baseStateDir, key), { recursive: true, force: true });
    }

    if (NAME === BASE || names.includes(NAME)) return;
    await sql.unsafe(`create database ${quoted(NAME)} template ${BASE}`);
    // The sessions of the copy are the sessions of its source. The files keep
    // their age: a session is used for half of its life only.
    rmSync(stateDir, { recursive: true, force: true });
    mkdirSync(stateDir, { recursive: true });
    if (!existsSync(baseStateDir)) return;
    for (const file of readdirSync(baseStateDir)) {
      if (!file.endsWith(".json")) continue;
      cpSync(path.join(baseStateDir, file), path.join(stateDir, file), {
        preserveTimestamps: true,
      });
    }
  } finally {
    await sql.end();
  }
}

/**
 * What each flow finds on file, in the order of the commands. Each command
 * changes nothing on its second run.
 *
 * - `db:push`: the schema of this checkout.
 *
 * The repo adds one row for each seed command: the account that the session
 * setup signs in as, and each row that a screen reads and no flow makes (a
 * setting, a rate, a bank account). A flow that fails on an empty database
 * and passes on the remote one names such a row.
 */
const START_DATA: readonly (readonly [workspace: string, script: string])[] = [
  ["{{SCOPE}}/db", "db:push"],
];

/**
 * Builds each package that a command of the start data imports. A new
 * worktree has no `dist` folder, and a command then fails on its first
 * import. turbo builds nothing that is built.
 */
function buildForStartData(): void {
  const filters = new Set(
    START_DATA.map(([workspace]) => `--filter=${workspace}^...`),
  );
  execFileSync("pnpm", ["exec", "turbo", "run", "build", ...filters], {
    cwd: repoRoot,
    stdio: ["ignore", "ignore", "inherit"],
  });
}

/**
 * What `drizzle-kit push` prints when it has a question and no terminal: is
 * a table (or a column) new, or the new name of one that the database has?
 * It then writes nothing and ends with code 0, so the exit code proves
 * nothing.
 */
const PUSH_ASKED = "Interactive prompts require a TTY";

/** True when the output of a `db:push` shows that the schema was not written. */
export function pushAsked(output: string): boolean {
  return output.includes(PUSH_ASKED);
}

/** What the newest migration snapshot of this checkout holds. */
function schemaOfCheckout(): {
  tables: Map<string, Set<string>>;
  enums: Set<string>;
} {
  const drizzleDir = path.join(repoRoot, "packages", "db", "drizzle", "meta");
  const journal: { entries: { idx: number }[] } = JSON.parse(
    readFileSync(path.join(drizzleDir, "_journal.json"), "utf8"),
  );
  const newest = Math.max(...journal.entries.map((entry) => entry.idx));
  const snapshot: {
    tables: Record<string, { columns: Record<string, unknown> }>;
    enums: Record<string, unknown>;
  } = JSON.parse(
    readFileSync(
      path.join(drizzleDir, `${String(newest).padStart(4, "0")}_snapshot.json`),
      "utf8",
    ),
  );
  return {
    tables: new Map(
      Object.entries(snapshot.tables).map(([name, table]) => [
        name,
        new Set(Object.keys(table.columns)),
      ]),
    ),
    enums: new Set(Object.keys(snapshot.enums)),
  };
}

/**
 * Removes each table, each column and each enum of `public` that this
 * checkout does not know. The copy of a worktree can hold them: its source
 * had the schema of a different checkout, or main removed a table after the
 * copy. With them gone, a schema push only adds, and has no question. Only
 * for the database of a worktree, which no second checkout uses.
 */
export async function dropUnknown(url: string): Promise<void> {
  const { tables, enums } = schemaOfCheckout();
  const sql = postgres(url, { max: 1, onnotice: () => {} });
  try {
    const columns = await sql<{ table: string; column: string }[]>`
      select table_name as table, column_name as column
      from information_schema.columns
      where table_schema = 'public'`;
    const dropped = new Set<string>();
    for (const { table, column } of columns) {
      const known = tables.get(`public.${table}`);
      if (!known) {
        if (dropped.has(table)) continue;
        dropped.add(table);
        await sql.unsafe(
          `drop table if exists public.${quoted(table)} cascade`,
        );
      } else if (!known.has(column)) {
        await sql.unsafe(
          `alter table public.${quoted(table)} drop column if exists ${quoted(column)} cascade`,
        );
      }
    }
    const types = await sql<{ name: string }[]>`
      select t.typname as name from pg_type t
      join pg_namespace n on n.oid = t.typnamespace
      where n.nspname = 'public' and t.typtype = 'e'`;
    for (const { name } of types) {
      if (enums.has(`public.${name}`)) continue;
      await sql.unsafe(`drop type if exists public.${quoted(name)} cascade`);
    }
  } finally {
    await sql.end();
  }
}

/** Runs one command of the start data on `url`, and answers what it printed. */
function runStartCommand(workspace: string, script: string, url: string) {
  const run = spawnSync("pnpm", ["--filter", workspace, script], {
    cwd: repoRoot,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    env: { ...process.env, DATABASE_URL: url },
  });
  if (run.error) throw run.error;
  process.stderr.write(run.stderr);
  if (run.status !== 0) {
    throw new Error(`${workspace} ${script} ended with code ${run.status}.`);
  }
  return run.stdout + run.stderr;
}

/** Writes the start data on the database `url`. */
async function writeStartData(url: string): Promise<void> {
  buildForStartData();
  for (const [workspace, script] of START_DATA) {
    let output = runStartCommand(workspace, script, url);
    if (!pushAsked(output)) continue;
    // The database of a worktree is its own: remove what the checkout does
    // not know, and push one more time.
    if (NAME !== BASE) {
      await dropUnknown(url);
      output = runStartCommand(workspace, script, url);
    }
    if (pushAsked(output)) {
      throw new Error(
        [
          `${workspace} ${script} did not write the schema of this checkout to the test database ${NAME}.`,
          "drizzle-kit had a question and no terminal: the database holds a table, a column or an enum that this checkout does not know, and this checkout adds one.",
          "Fix: when your schema change has no migration yet, run `pnpm --filter <scope>/db db:generate`. When main has a newer migration, run `git pull --rebase origin main` and make your own migration again on top of main. Then run again.",
          "Do not change a flow for this, and do not empty the test database.",
        ].join("\n"),
      );
    }
  }
}

/**
 * Starts the server and writes the start data. Answers the URL of the
 * database of the run.
 */
export async function startTestDatabase(): Promise<string> {
  if (!existsSync(path.join(dataDir, "PG_VERSION"))) makeCluster();
  if (!runs()) tool("pg_ctl", ["start", "-w", "-D", dataDir, "-l", serverLog]);
  await makeDatabase();
  const url = urlOf(NAME);
  await writeStartData(url);
  return url;
}

/** Stops the server. Each connection ends: the run is over. */
export function stopTestDatabase(): void {
  if (runs()) tool("pg_ctl", ["stop", "-m", "fast", "-D", dataDir]);
}
