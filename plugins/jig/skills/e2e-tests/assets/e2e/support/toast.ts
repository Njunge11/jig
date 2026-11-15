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
 * Waits until the toast with the text `text` is gone. A toast stays while
 * the pointer is on it, and a click leaves the pointer where the next toast
 * shows. A toast that stays covers the controls under it, and a click on one
 * of them never lands. So the pointer leaves first, as a person's does.
 *
 * One move of the pointer is not always enough. In a run of 4 workers a
 * toast stayed open (`data-expanded="true"`) for 15 seconds after the one
 * move. So each try puts the pointer on the toast and takes it off again:
 * the toast gets the two events, in order.
 */
export async function toastGone(page: Page, text: string) {
  const toast = toastOf(page, text);
  await expect(async () => {
    const box = await toast
      .first()
      .boundingBox({ timeout: 1_000 })
      .catch(() => null);
    if (box) {
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    }
    await page.mouse.move(0, 0);
    // A toast closes 4 seconds after the pointer leaves it.
    await expect(toast).toHaveCount(0, { timeout: 6_000 });
  }).toPass();
}
