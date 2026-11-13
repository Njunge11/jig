import { existsSync, statSync } from "node:fs";

import { test as setup, type Page } from "@playwright/test";

import { appUnderTest, type AppName } from "./apps";

/**
 * Signs in once and saves the browser state the other projects start from.
 * A saved state that still opens the app is kept: a run then adds no new
 * device to the account and asks for no new link or code. A state older than
 * half the life of a session is not used: its session can end in the middle
 * of the run. The file is written only at a sign-in, so its time is the time
 * of that sign-in.
 */

const app = appUnderTest();

/**
 * Who signs in to each app, through the real sign-in screens: the repo
 * writes one function per app (the seeded account, its password, the code
 * or the link from `inbox.ts`). An app with no sign-in yet has an empty one.
 */
const SIGN_IN: Record<AppName, (page: Page) => Promise<void>> = {
  web: async () => {},
};

function isFresh(statePath: string) {
  if (!existsSync(statePath)) return false;
  return Date.now() - statSync(statePath).mtimeMs < app.stateMaxAgeMs;
}

setup(`sign in to ${app.name}`, async ({ browser }) => {
  const context = await browser.newContext(
    isFresh(app.statePath) ? { storageState: app.statePath } : {},
  );
  const page = await context.newPage();
  await page.goto(app.home);
  const signedIn = new URL(page.url()).pathname === app.home;
  if (!signedIn) await SIGN_IN[app.name](page);
  // An app with no sign-in yet still needs the file: the projects read it.
  if (!signedIn || !existsSync(app.statePath)) {
    await context.storageState({ path: app.statePath });
  }
  await context.close();
});
