import { expect, type Page } from "@playwright/test";

/**
 * Calls the procedure `path` of the app as the person of `page`, with no
 * screen, and gives its answer. A flow that needs a starting point that it
 * does not prove gets it this way (Playwright, API testing, "Establishing
 * preconditions"): the app runs the same services with the same permissions.
 */
export async function callApp<Answer>(
  page: Page,
  path: string,
  input: unknown,
) {
  const response = await page.request.post(`/api/trpc/${path}?batch=1`, {
    data: { 0: { json: input } },
  });
  expect(response.ok(), `${path} answers`).toBe(true);
  const body: [{ result: { data: { json: Answer } } }] = await response.json();
  return body[0].result.data.json;
}

/**
 * Reads the query `path` of the app as the person of `page`, with no screen,
 * and gives its answer. A query with no input takes none.
 */
export async function readApp<Answer>(
  page: Page,
  path: string,
  input?: unknown,
) {
  const sent =
    input === undefined
      ? { 0: { json: null, meta: { values: ["undefined"] } } }
      : { 0: { json: input } };
  const response = await page.request.get(`/api/trpc/${path}`, {
    params: { batch: 1, input: JSON.stringify(sent) },
  });
  expect(response.ok(), `${path} answers`).toBe(true);
  const body: [{ result: { data: { json: Answer } } }] = await response.json();
  return body[0].result.data.json;
}
