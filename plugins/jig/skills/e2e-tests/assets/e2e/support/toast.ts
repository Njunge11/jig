import type { Page } from "@playwright/test";

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
