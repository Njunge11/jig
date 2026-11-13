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
const APPS = {
  web: { port: 3100, width: 1440, height: 900, home: "/" },
} as const;

export type AppName = keyof typeof APPS;

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

/** Where a run writes: screenshots, the saved session and the server log. */
export const outputDir = path.join(packageDir, ".output");

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
  const app = APPS[name];
  const width = Number(process.env.WIDTH ?? app.width);
  return {
    name,
    port: app.port,
    url: `http://localhost:${app.port}`,
    viewport: { width, height: app.height },
    /** The page a signed-in person lands on; a signed-out visit leaves it. */
    home: app.home,
    /** The signed-in browser state the `session` project saves. */
    statePath: path.join(outputDir, "state", `${name}.json`),
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
