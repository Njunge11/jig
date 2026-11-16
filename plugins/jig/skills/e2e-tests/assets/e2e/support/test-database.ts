import { execFileSync, spawnSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import {
  appendFileSync,
  chmodSync,
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";

import postgres from "postgres";

// Plain node runs this file (`run.ts`): the import names the full file.
import { repoRoot, stateDir } from "./apps.ts";

/**
 * The database of a run: a PostgreSQL server on this machine, with its own
 * data folder and its own port. A run does not use the database of `.env`.
 *
 * Why: the database of `.env` is remote, and each statement of each request
 * of each step pays one round trip to it. Measured on one repo: 188 ms for a
 * statement there and 0.1 ms here.
 *
 * - The data folder is beside the saved sessions, in the main checkout: each
 *   worktree uses the same database, as it uses the same sessions. `initdb`
 *   makes it on the first run and refuses a folder that holds files
 *   (PostgreSQL docs, "Creating a Database Cluster"). To start from an empty
 *   database, delete `packages/e2e/.output/postgres` of the main checkout
 *   and `packages/e2e/.output/state`.
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
const NAME = "e2e";

const home = path.join(path.dirname(stateDir), "postgres");
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
  return `postgres://${NAME}:${password()}@127.0.0.1:${PORT}/${database}`;
}

function makeCluster(): void {
  mkdirSync(home, { recursive: true });
  writeFileSync(passwordFile, `${randomBytes(24).toString("hex")}\n`);
  chmodSync(passwordFile, 0o600);
  tool("initdb", [
    "-D",
    dataDir,
    "-U",
    NAME,
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

async function makeDatabase(): Promise<void> {
  const sql = postgres(urlOf("postgres"), { max: 1, onnotice: () => {} });
  try {
    const found =
      await sql`select 1 from pg_database where datname = ${NAME}`;
    if (found.length === 0) await sql.unsafe(`create database ${NAME}`);
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

/** Writes the start data on the database `url`. */
function writeStartData(url: string): void {
  buildForStartData();
  for (const [workspace, script] of START_DATA) {
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
    if (pushAsked(run.stdout + run.stderr)) {
      throw new Error(
        [
          `${workspace} ${script} did not write the schema of this checkout to the test database.`,
          "The test database holds a table or a column that this checkout does not know, and this checkout adds one, so drizzle-kit had a question.",
          "The usual cause: main has a newer migration, and the run of a second worktree wrote it to the shared test database.",
          "Fix: commit, run `git pull --rebase origin main`, make your own migration again on top of main, and run again.",
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
  writeStartData(url);
  return url;
}

/** Stops the server. Each connection ends: the run is over. */
export function stopTestDatabase(): void {
  if (runs()) tool("pg_ctl", ["stop", "-m", "fast", "-D", dataDir]);
}
