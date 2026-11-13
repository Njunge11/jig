import { expect, test, type Page } from "@playwright/test";

import { collectPageErrors } from "./settle";

/**
 * The steps of one flow test. A flow whose steps build on each other is one
 * test, so it needs no second test to run first and runs beside the other
 * tests. Each step is a `test.step`: the report lists it by name, with the
 * screen each page ended on, the failed step among them.
 *
 * A step fails on a fault the screen hides (`collectPageErrors`). A step
 * whose point is a refusal empties `errors` itself and says why.
 *
 * `pages` names each person's page: `{ MD: page, member: visitor }`.
 */
export function flowSteps(pages: Record<string, Page>) {
  const errors: string[] = [];
  for (const page of Object.values(pages)) collectPageErrors(page, errors);

  async function step<T>(name: string, body: () => Promise<T>): Promise<T> {
    return test.step(name, async () => {
      const result = await body();
      for (const [who, page] of Object.entries(pages)) {
        await test.info().attach(`${who}: end of the step`, {
          body: await page.screenshot(),
          contentType: "image/png",
        });
      }
      expect(errors.splice(0), "no page threw in this step").toEqual([]);
      return result;
    });
  }

  return { step, errors };
}
