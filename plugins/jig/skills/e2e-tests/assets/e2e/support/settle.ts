import { expect, type Page } from "@playwright/test";

/**
 * Waits until a page shows its content: the document and its fonts are
 * loaded and no skeleton is left on screen. It does not wait for the network
 * to go quiet: the app prefetches the pages its links point to.
 */
export async function settle(page: Page) {
  await page.waitForLoadState("load");
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator('[data-slot="skeleton"]:visible')).toHaveCount(0, {
    timeout: 20_000,
  });
}

/** The line the browser prints for each failed request; `response` reports those. */
const FAILED_REQUEST = /^Failed to load resource/;

/**
 * Collects each fault the screen can hide, so a test fails on it: an error
 * the page throws (a `ReferenceError` in a component), an error it prints,
 * a refused API call and a server failure.
 *
 * A 404 of a page is not a fault here: the side nav prefetches the pages of
 * specs that are not built yet.
 */
export function collectPageErrors(page: Page, errors: string[] = []): string[] {
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error" && !FAILED_REQUEST.test(message.text())) {
      errors.push(message.text());
    }
  });
  page.on("response", (response) => {
    const { pathname } = new URL(response.url());
    const status = response.status();
    if (status >= 500 || (status >= 400 && pathname.startsWith("/api/"))) {
      errors.push(`${status} ${response.request().method()} ${pathname}`);
    }
  });
  return errors;
}
