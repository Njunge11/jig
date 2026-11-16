import { expect, type Page } from "@playwright/test";

/**
 * The toast with the text `text`. A page can show the same words in a second
 * place (the activity of a deal, the row of a document), and its new data
 * can be on screen while the toast still shows: a locator of the text alone
 * then answers two elements.
 */
export const toastOf = (page: Page, text: string) =>
  page
    .getByRole("region", { name: /^Notifications/ })
    .getByText(text, { exact: true });

/**
 * The list items of the page, without the toasts. A toast is a list item
 * too, and it often holds the name of the thing that a row holds ("Aoi Sato
 * removed"). A locator of each list item of the document then counts the
 * toast as a row for the 4 seconds that the toast shows: a wait for the row
 * to go took 4.3 seconds each time. No role tells a toast from a row, so the
 * attribute of the toast library does.
 */
export const listItemsOf = (page: Page) =>
  page.getByRole("listitem").and(page.locator(":not([data-sonner-toast])"));

/**
 * Takes the toast with the text `text` off the screen: a swipe down, as a
 * person does who does not wait for it. A toast that stays covers the
 * controls under it, and a click on one of them never lands.
 *
 * A toast closes by itself 4 seconds after the pointer leaves it, and a wait
 * for that took 4.3 seconds for each toast (measured: 75 seconds in a sample
 * of 31 tests). The swipe has the steps of the toast library's own
 * Playwright test ("toast's dismiss callback gets executed correctly",
 * sonner, test/tests/basic.spec.ts): from the centre of the toast, a small
 * move that starts the drag, then the main move.
 *
 * A try that does not close the toast is made again after 1 second. The
 * pointer leaves the toast at the end of each try, so a toast that no swipe
 * closes still closes by itself.
 */
export async function toastGone(page: Page, text: string) {
  const toast = toastOf(page, text);
  await expect(async () => {
    const box = await page
      .locator("[data-sonner-toast]")
      .filter({ hasText: text })
      .first()
      .boundingBox({ timeout: 1_000 })
      .catch(() => null);
    if (box) {
      const x = box.x + box.width / 2;
      const y = box.y + box.height / 2;
      await page.mouse.move(x, y);
      await page.mouse.down();
      await page.mouse.move(x, y + 20, { steps: 5 });
      await page.mouse.move(x, y + 300, { steps: 10 });
      await page.mouse.up();
    }
    await page.mouse.move(0, 0);
    // A short wait, then the next try: a swipe does not reach a toast while
    // a dialog that closes still takes the pointer (measured: 4 of 10).
    await expect(toast).toHaveCount(0, { timeout: 1_000 });
  }).toPass();
}
