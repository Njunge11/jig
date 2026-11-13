import { expect, test } from "@playwright/test";

import { appUnderTest } from "../../support/apps";
import { collectPageErrors, settle } from "../../support/settle";

/**
 * The first flow of a new repo: the built app starts, its home page opens
 * and no fault hides behind the screen. The first feature replaces it with
 * the flows of its spec.
 */

const app = appUnderTest();

test("the home page opens and throws no error", async ({ page }) => {
  const errors = collectPageErrors(page);

  const response = await page.goto(app.home);
  await settle(page);

  expect(response?.status()).toBe(200);
  expect(errors).toEqual([]);
});
