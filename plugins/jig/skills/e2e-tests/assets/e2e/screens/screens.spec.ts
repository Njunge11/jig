import { expect, test } from "@playwright/test";

import { appUnderTest } from "../support/apps";
import { collectPageErrors, settle } from "../support/settle";
import { designOf } from "../support/design";
import { expectDesign, shot } from "../support/shot";

/**
 * Saves a full-page screenshot of each route in `SCREENS` (split by a space
 * or a comma). An entry is `<Design>=<path>`, as in
 * `Deals=/deals`: the report then shows the built screen beside
 * `docs/designs/Deals.dc.html`. A path alone gets a name from its route.
 *
 * A route fails when the page answers with an error, sends the person to a
 * different page, throws in the browser, or looks different from its design.
 */

const app = appUnderTest();
const screens = (process.env.SCREENS ?? "")
  .split(/[\s,]+/)
  .filter(Boolean)
  .map(screenOf);

/** `Deals=/deals` → the picture's name and the route; `/deals` → the route's name. */
function screenOf(entry: string) {
  const named = /^([A-Za-z0-9]+)=(\/.*)$/.exec(entry);
  if (named) return { name: named[1] ?? "", route: named[2] ?? "" };
  return { name: nameOf(entry), route: entry };
}

/** `/deals/new?step=2` → `deals-new-step-2`; `/` → `index`. */
function nameOf(route: string): string {
  const name = route.replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "");
  return name || "index";
}

test("SCREENS names the routes to draw", () => {
  expect(
    screens,
    'Set SCREENS, for example SCREENS="Deals=/deals /deals/new".',
  ).not.toHaveLength(0);
});

for (const { name, route } of screens) {
  test(`screen ${route}`, async ({ page }) => {
    const errors = collectPageErrors(page);
    const response = await page.goto(route);
    expect(response?.status(), `${route} answers`).toBeLessThan(400);
    await settle(page);
    expect(new URL(page.url()).pathname, `${route} stays open`).toBe(
      new URL(route, app.url).pathname,
    );

    // A screen that has a design must look like it: the check fails on a
    // color, a type size, a radius or a place that is different.
    if (designOf(name)) await expectDesign(page, name);
    else await shot(page, name);

    expect(errors, `${route} throws nothing in the browser`).toEqual([]);
  });
}
