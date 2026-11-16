import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * The app one run draws: its port, its design width and where the run keeps
 * its files. `APP` picks it (the first row when unset).
 *
 * The ports are not the dev ports (3000 and up): a run starts its own
 * server from a new build and never reads a server that was already there.
 */

// One row per app: `scaffold-repo` writes them. The ports start at 3100.
// `sessionHours`: how long a session of the app lasts from its sign-in.
const APPS = {
  web: { port: 3100, width: 1440, height: 900, home: "/", sessionHours: 24 },
} as const;

export type AppName = keyof typeof APPS;

/**
 * The apps a flows run starts beside the app under test. A flow that starts
 * in one app and crosses a second one (a person of the second app answers a
 * step of the first) is in the folder of the first app, and names the second
 * app here.
 */
const PEERS: Record<AppName, readonly AppName[]> = {
  web: [],
};

/**
 * The parts of an app that keep the developer's look and are on each of its
 * pages: a shell. The design check leaves out each text inside them, on the
 * built page (`built`) and on the design (`design`), so a page in the shell
 * is compared in its own part. This is the `mask` of a Playwright
 * screenshot, for a check that reads values and not pixels. A selector,
 * never a text or a value. An app with no kept part has two empty lists.
 */
const KEPT: Record<AppName, { built: string[]; design: string[] }> = {
  web: { built: [], design: [] },
};

const packageDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

/** The repo root, where the build command runs. */
export const repoRoot = path.resolve(packageDir, "../..");

/**
 * The CSS file that each app loads: Tailwind and the theme of the apps. The
 * design check asks Tailwind what each stock class gives with this theme.
 */
export const themeCss = path.join(
  repoRoot,
  "packages/ui/src/styles/globals.css",
);

/** Where a run writes: screenshots, the report and the server log. */
export const outputDir = path.join(packageDir, ".output");

/**
 * The checkout that keeps the saved sessions: the main one. A worktree of
 * the repo has its own `.output`, and with its own sessions it signs in
 * again on its first run. A server limits that (the links an address gets in
 * a day, the devices of an account), so each worktree uses the sessions of
 * the main checkout and signs in only when they are too old.
 */
function sessionCheckout(): string {
  try {
    const gitDir = execFileSync(
      "git",
      ["rev-parse", "--path-format=absolute", "--git-common-dir"],
      { cwd: repoRoot, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] },
    ).trim();
    const main = path.dirname(gitDir);
    const sameSuite = path.join(main, path.relative(repoRoot, packageDir));
    return existsSync(sameSuite) ? main : repoRoot;
  } catch {
    return repoRoot;
  }
}

const mainCheckout = sessionCheckout();

/**
 * The files that each checkout of the repo uses: the data folder of the test
 * database server and the saved sessions. They are in the main checkout.
 */
export const sharedOutputDir = path.join(
  mainCheckout,
  path.relative(repoRoot, packageDir),
  ".output",
);

/** `83-add-exporter` as `83_add_exporter`: a part of a database name. */
export function checkoutKeyOf(folder: string): string {
  return path
    .basename(folder)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .slice(0, 40);
}

/**
 * What names the test database and the sessions of this checkout: empty for
 * the main checkout, the folder name for a worktree. Two builders work in
 * two worktrees at the same time, each on a schema of its own, so a
 * worktree has its own copy of the test database and of the sessions.
 */
export const checkoutKey =
  mainCheckout === repoRoot ? "" : checkoutKeyOf(repoRoot);

/** The saved sessions of the main checkout: a new worktree starts from a copy. */
export const baseStateDir = path.join(sharedOutputDir, "state");

/** Where the saved sessions of this checkout live. */
export const stateDir = checkoutKey
  ? path.join(baseStateDir, checkoutKey)
  : baseStateDir;

/**
 * The browser state of a person who is signed out. The flows start signed
 * in: `test.use({ storageState: signedOut })` starts a file signed out, and
 * `browser.newContext({ storageState: signedOut })` opens a second person's
 * browser.
 */
export const signedOut = { cookies: [], origins: [] };

function isAppName(name: string): name is AppName {
  return name in APPS;
}

export function appUnderTest() {
  const name = process.env.APP ?? Object.keys(APPS)[0] ?? "";
  if (!isAppName(name)) {
    throw new Error(
      `APP is "${name}". Use one of: ${Object.keys(APPS).join(", ")}.`,
    );
  }
  return appOf(name, Number(process.env.WIDTH ?? APPS[name].width));
}

/**
 * The apps one run starts: the app under test first, then, in a flows run,
 * its peers. Each app has its own port, build, server log and session.
 */
export function appsOfRun() {
  const app = appUnderTest();
  const peers = process.env.RUN === "flows" ? PEERS[app.name] : [];
  return [app, ...peers.map((name) => appOf(name))];
}

/**
 * The kept parts of the app that serves the page at `url`. A flow of one app
 * can open a page of a second app, so the address of the page picks the app,
 * not `APP`.
 */
export function keptOf(url: string): { built: string[]; design: string[] } {
  const port = Number(new URL(url).port);
  for (const [name, app] of Object.entries(APPS)) {
    if (app.port === port && isAppName(name)) return KEPT[name];
  }
  return { built: [], design: [] };
}

/** The port, the window and the files of the app `name`. */
export function appOf(name: AppName, width: number = APPS[name].width) {
  const app = APPS[name];
  return {
    name,
    port: app.port,
    url: `http://localhost:${app.port}`,
    viewport: { width, height: app.height },
    /** The page a signed-in person lands on; a signed-out visit leaves it. */
    home: app.home,
    /** The signed-in browser state the `session` project saves. */
    statePath: path.join(stateDir, `${name}.json`),
    /**
     * How old the saved state can be: half the life of a session. An older
     * session can end in the middle of a run, and each test after it fails.
     */
    stateMaxAgeMs: (app.sessionHours * 60 * 60 * 1000) / 2,
    /** Where `next build` writes the app. */
    buildDir: path.join(repoRoot, "apps", name, ".next"),
    /** Everything the server printed, the emails of the console sender among it. */
    serverLogPath: path.join(outputDir, `server-${name}.log`),
    screensDir: path.join(outputDir, "screens", name),
    /** The page the developer opens after a run: `RUN` is `screens` or `flows`. */
    reportDir: path.join(
      outputDir,
      "report",
      `${name}-${process.env.RUN ?? "run"}`,
    ),
  };
}
