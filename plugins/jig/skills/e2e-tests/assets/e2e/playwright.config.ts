import { mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { defineConfig } from "@playwright/test";

import { appsOfRun, appUnderTest, outputDir, repoRoot } from "./support/apps";

/**
 * Draws the built app in a headless browser, on the database of the run
 * (`support/test-database.ts`): `support/run.ts` starts it and gives its URL
 * as `DATABASE_URL`, in place of the one of `.env`.
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
  // Start with 2. The workers share one server and one machine: raise
  // the number only while a measured run gets shorter and no step runs out
  // of time, and write the measured numbers here.
  workers: 2,
  forbidOnly: true,
  // The limit of one step of a flow, and of a test with no step: `flowSteps`
  // gives a test this time for each step, so no flow sets a limit. Set it
  // from a measured full run and write the numbers here: the longest step,
  // times the largest spread of one test between runs. A step that needs
  // more time is two steps.
  timeout: 90_000,
  // Playwright's own limit is 5 seconds. Lower this number only with a
  // measured full run.
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
  webServer: apps.map((each) => ({
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
      // One line per app that links to a peer, with the URL of that peer in
      // the run. For example: PORTAL_URL: appOf("portal").url.
      // One line per sender, with no key: the console sender then prints
      // each email and each SMS to the server log, and no flow sends a real
      // message. For example: EMAIL_API_KEY: "".
    },
  })),
});
