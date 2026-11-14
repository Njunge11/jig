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

/** Where the saved sessions live, for each worktree of the repo. */
export const stateDir = path.join(
  sessionCheckout(),
  path.relative(repoRoot, packageDir),
  ".output",
  "state",
);

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
