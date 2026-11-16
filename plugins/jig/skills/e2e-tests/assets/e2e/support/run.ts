import { execFileSync, spawn, type ChildProcess } from "node:child_process";
import {
  mkdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { setTimeout as sleep } from "node:timers/promises";
import { fileURLToPath } from "node:url";

import { startTestDatabase, stopTestDatabase } from "./test-database.ts";

/**
 * Starts one run of this package:
 * `node support/run.ts <screens|flows> [arguments of playwright test]`.
 * `pnpm screens` and `pnpm flows` call it, and so does the pre-push hook.
 * It does three things before Playwright starts.
 *
 * One run at a time on this machine. Each worktree of the repo uses the same
 * ports and the same database. A second run that starts while the first
 * builds finds the first server on its port and tests that server: its
 * emails are in the log of the other worktree, and its tests fail when the
 * first run stops the server. So a run waits for the run that holds
 * `e2e.lock` in the shared git folder. A lock whose process ended is taken.
 *
 * The run has its own database, on this machine (`test-database.ts`): the
 * run starts its server, gives the apps and the tests its URL in place of
 * the `DATABASE_URL` of `.env`, and stops the server at the end.
 *
 * A filter selects files of this package. Playwright compares a filter with
 * the full path of a file (`forceRegExp` in its `util.js`), and a worktree
 * has the name of its checklist: in `12-order-export/` the filter
 * `order-export` selects each file, and the run is the full suite. A filter
 * that the path of this package answers is compared with the part of the
 * path inside the package.
 */
const packageDir = fileURLToPath(new URL("..", import.meta.url));
const root = `${packageDir.replaceAll(path.sep, "/").replace(/\/$/, "")}/`;

const [run, ...given] = process.argv.slice(2);
if (run !== "screens" && run !== "flows") {
  throw new Error("Give the run: screens or flows");
}

/** The options of `playwright test` that take the next argument as a value. */
const TAKES_VALUE = new Set([
  "--add-reporter",
  "--browser",
  "-c",
  "--config",
  "--debug",
  "-g",
  "--grep",
  "-G",
  "--grep-invert",
  "--global-timeout",
  "-j",
  "--workers",
  "--last-failed-file",
  "--max-failures",
  "--only-changed",
  "--output",
  "--project",
  "--repeat-each",
  "--reporter",
  "--retries",
  "--run-agents",
  "--shard",
  "--shuffle",
  "--test-list",
  "--test-list-invert",
  "--timeout",
  "--trace",
  "--tsconfig",
  "-u",
  "--update-snapshots",
  "--ui-host",
  "--ui-port",
  "--update-source-method",
]);

const escaped = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** `filter`, compared with the path inside this package when the path of the package answers it. */
function inPackage(filter: string): string {
  // Playwright reads `name:line:column` the same way (`util.js`).
  const [, name = filter, place = ""] =
    /^(.*?)((?::\d+){1,2})$/.exec(filter) ?? [];
  if (name.startsWith("^")) return filter;
  try {
    if (!new RegExp(name, "i").test(root)) return filter;
  } catch {
    return filter;
  }
  return `^${escaped(root)}.*(?:${name})${place}`;
}

const args: string[] = [];
for (let index = 0; index < given.length; index += 1) {
  const arg = given[index]!;
  if (arg.startsWith("-")) {
    args.push(arg);
    const value = given[index + 1];
    if (TAKES_VALUE.has(arg) && value !== undefined && !value.startsWith("-")) {
      args.push(value);
      index += 1;
    }
  } else {
    args.push(inPackage(arg));
  }
}

/** A list of tests starts no server: it takes no lock and writes no report. */
const listsOnly = args.includes("--list") || args.includes("--help");
if (args.includes("--list")) args.push("--reporter=list");

const lock = path.join(
  execFileSync(
    "git",
    ["rev-parse", "--path-format=absolute", "--git-common-dir"],
    { cwd: packageDir, encoding: "utf8" },
  ).trim(),
  "e2e.lock",
);
const pidFile = path.join(lock, "pid");
/** A lock with no process number is of a run that starts, or of a hook of an older checkout. */
const NO_NUMBER_LIMIT = 45 * 60_000;

function holder(): number {
  try {
    return Number(readFileSync(pidFile, "utf8"));
  } catch {
    return 0;
  }
}

function alive(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return (error as NodeJS.ErrnoException).code === "EPERM";
  }
}

function ended(pid: number): boolean {
  if (pid) return !alive(pid);
  try {
    return Date.now() - statSync(lock).mtimeMs > NO_NUMBER_LIMIT;
  } catch {
    return true;
  }
}

async function takeLock(): Promise<void> {
  let told = 0;
  for (;;) {
    try {
      mkdirSync(lock);
      writeFileSync(pidFile, String(process.pid));
      return;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error;
    }
    const pid = holder();
    if (ended(pid)) {
      // Only the lock that was read: a new run can take the lock in between.
      if (holder() === pid) rmSync(lock, { recursive: true, force: true });
      continue;
    }
    if (Date.now() - told > 5 * 60_000) {
      told = Date.now();
      console.log(
        `e2e: another end-to-end run${pid ? ` (process ${pid})` : ""} is active on this machine. This run starts when that run ends. Do not start a second run, and do not remove ${lock}.`,
      );
    }
    await sleep(5_000);
  }
}

/** Ends the run: the server of the database stops, then the lock goes. */
function release(): void {
  if (holder() !== process.pid) return;
  try {
    stopTestDatabase();
  } finally {
    rmSync(lock, { recursive: true, force: true });
  }
}

let child: ChildProcess | undefined;
for (const signal of ["SIGINT", "SIGTERM", "SIGHUP"] as const) {
  process.on(signal, () => {
    if (child) {
      // The Playwright runner stops its servers on SIGINT only (its
      // `SigIntWatcher`). A SIGTERM ends it at once, and the three app
      // servers stay on their ports. So each stop signal goes on as SIGINT.
      child.kill("SIGINT");
    } else {
      release();
      process.exit(1);
    }
  });
}

const env: NodeJS.ProcessEnv = { ...process.env, RUN: run };
if (!listsOnly) {
  await takeLock();
  try {
    env.DATABASE_URL = await startTestDatabase();
  } catch (error) {
    release();
    throw error;
  }
}
child = spawn(
  path.join(packageDir, "node_modules", ".bin", "playwright"),
  ["test", `--project=${run}`, ...args],
  { cwd: packageDir, stdio: "inherit", env },
);
child.on("exit", (code) => {
  if (!listsOnly) release();
  process.exit(code ?? 1);
});
