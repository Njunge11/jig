import { expect, type Page } from "@playwright/test";

/**
 * The toast with the text `text`. A page can show the same words in a second
 * place (the activity of a record, the row of a list), and its new data
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
 */
export async function toastGone(page: Page, text: string) {
  await page.mouse.move(0, 0);
  await expect(toastOf(page, text)).toHaveCount(0);
}
