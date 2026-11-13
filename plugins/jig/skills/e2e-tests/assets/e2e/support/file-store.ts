import type { Page } from "@playwright/test";

/**
 * The host of the file store that the browser sends a file to. The repo
 * writes its own test: this one is a bucket of Amazon S3.
 */
const isStore = (url: URL) => url.hostname.endsWith(".amazonaws.com");

/**
 * The file store takes a file from the addresses of the apps only, and a run
 * starts the app on a port of its own. So the run sends each upload of `page`
 * to the store itself, with no change, and gives the page the store's answer
 * as an answer that the browser reads. The file is in the real store: the
 * app's next step finds it there. No port of a run goes into the settings of
 * the store.
 */
export async function carryUploads(page: Page) {
  await page.route(isStore, async (route) => {
    const request = route.request();
    if (request.method() !== "POST") return route.continue();
    const response = await route.fetch();
    await route.fulfill({
      response,
      headers: {
        ...response.headers(),
        "access-control-allow-origin":
          (await request.headerValue("origin")) ?? "*",
      },
    });
  });
}
