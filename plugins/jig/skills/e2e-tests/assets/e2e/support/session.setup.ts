import { existsSync } from "node:fs";

import { test as setup, type Page } from "@playwright/test";

import { appUnderTest, type AppName } from "./apps";

/**
 * Signs in once and saves the browser state the other projects start from.
 * A saved state that still opens the app is kept: a run then adds no new
 * device to the account and asks for no new link or code.
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

setup(`sign in to ${app.name}`, async ({ browser }) => {
  const context = await browser.newContext(
    existsSync(app.statePath) ? { storageState: app.statePath } : {},
  );
  const page = await context.newPage();
  await page.goto(app.home);
  if (new URL(page.url()).pathname !== app.home) {
    await SIGN_IN[app.name](page);
  }
  await context.storageState({ path: app.statePath });
  await context.close();
});
