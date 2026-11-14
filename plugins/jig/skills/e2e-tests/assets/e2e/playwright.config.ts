import { mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { defineConfig } from "@playwright/test";

import { appsOfRun, appUnderTest, outputDir, repoRoot } from "./support/apps";

/**
 * Draws the built app in a headless browser, on the one database of `.env`.
 *
 * - `screens` draws each route in `SCREENS` and compares it with its design
 *   source in `docs/designs`.
 * - `flows` runs each flow of the app from its first screen to its last.
 *
 * Each run empties the build folder of the app, builds the app, starts it
 * on its own port and stops it at the end. No window opens. A flows run
 * also starts the peers of the app (`appsOfRun`), for a flow that crosses
 * apps.
 */

const app = appUnderTest();

// The sessions are in the main checkout, so a new worktree has no output
// folder yet: the server of the run writes its log there.
mkdirSync(outputDir, { recursive: true });
mkdirSync(path.dirname(app.statePath), { recursive: true });

// A cached build goes on top of the last build folder, and the pages that
// the last server saved there stay: the run empties the folder first.
const cleanBuild = fileURLToPath(
  new URL("support/clean-build.ts", import.meta.url),
);

const apps = appsOfRun();

/**
 * The run is one more server on the connections of the pooler. The run and
 * the dev servers in use fit in its limit: on a pooler of 15, two dev
 * servers in use (4 each) and a script leave 6. A full pooler fails the
 * session check of a dev server and signs the developer out. A peer only
 * answers the steps of a flow that crosses apps: it takes 1, and the app
 * under test the rest.
 */
const RUN_POOL = 6;
const poolOf = (index: number) =>
  index === 0 ? RUN_POOL - (apps.length - 1) : 1;

export default defineConfig({
  outputDir: path.join(outputDir, "results"),
  // The report is the page the developer opens: each flow step with the
  // screen it ended on, and each built screen beside its design.
  reporter: [
    ["list"],
    ["html", { outputFolder: app.reportDir, open: "never" }],
  ],
  // Each test makes its own data and reads its own messages, so the tests
  // of a file run at the same time. The workers share one server, one
  // database and one server log.
  fullyParallel: true,
  // Start with 2. The workers share one server and its database pool: raise
  // the number only while a measured run gets shorter and no step runs out
  // of time, and write the measured numbers here.
  workers: 2,
  forbidOnly: true,
  timeout: 90_000,
  // The database is remote: a page that reads it can take seconds to fill.
  expect: { timeout: 15_000 },
  use: {
    baseURL: app.url,
    viewport: app.viewport,
    colorScheme: "light",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "session", testDir: "support", testMatch: "session.setup.ts" },
    {
      name: "screens",
      testDir: "screens",
      dependencies: process.env.SIGNED_OUT ? [] : ["session"],
      use: process.env.SIGNED_OUT ? {} : { storageState: app.statePath },
    },
    {
      name: "flows",
      testDir: path.join("flows", app.name),
      dependencies: ["session"],
      // A flow starts signed in. A file that starts signed out says so:
      // `test.use({ storageState: signedOut })`.
      use: { storageState: app.statePath, screenshot: "on" },
    },
  ],
  webServer: apps.map((each, index) => ({
    command: [
      `node "${cleanBuild}" "${each.buildDir}"`,
      `pnpm exec turbo run build --filter={{SCOPE}}/${each.name}`,
      `pnpm --filter {{SCOPE}}/${each.name} exec next start -p ${each.port} > "${each.serverLogPath}" 2>&1`,
    ].join(" && "),
    cwd: repoRoot,
    url: each.url,
    // A server that already answers on the port is not this build: refuse it.
    reuseExistingServer: false,
    timeout: 600_000,
    env: {
      AUTH_URL: each.url,
      DATABASE_POOL_MAX: String(poolOf(index)),
      // One line per app that links to a peer, with the URL of that peer in
      // the run. For example: PORTAL_URL: appOf("portal").url.
      // One line per sender, with no key: the console sender then prints
      // each email and each SMS to the server log, and no flow sends a real
      // message. For example: EMAIL_API_KEY: "".
    },
  })),
});
