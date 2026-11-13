import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

import { expect, test, type Page } from "@playwright/test";

import { appUnderTest } from "./apps";
import {
  compareLooks,
  describeCheck,
  designOf,
  drawDesign,
  type DesignCheck,
} from "./design";
import { readLook } from "./read-look";
import { settle } from "./settle";
import { stockSteps } from "./stock-steps";

export type Shot = {
  /** The full-page screenshot of the built screen. */
  file: string;
  /** The built screen against its design, when `docs/designs` holds one. */
  check: DesignCheck | null;
};

/**
 * Saves a full-page screenshot of what the page shows now. When
 * `docs/designs/<name>.dc.html` exists, it also draws that design at the
 * same window size and compares the look of each text the two screens show.
 *
 * `pnpm screens` calls it for a route. A flow calls it for a screen that a
 * route alone does not show: a dialog, a sheet, a state of a record. Name
 * the screen after its design: `shot(page, "DocumentsUpload")`.
 *
 * Beside the screenshot it writes `<name>-<width>-design.png` (the design
 * as the browser draws it) and `<name>-<width>.design.json` (the check).
 * The run's report shows the two screens side by side: it pairs an
 * `-expected` with an `-actual` file.
 */
export async function shot(page: Page, name: string): Promise<Shot> {
  const app = appUnderTest();
  await settle(page);
  mkdirSync(app.screensDir, { recursive: true });
  const base = path.join(app.screensDir, `${name}-${app.viewport.width}`);
  const file = `${base}.png`;
  await page.screenshot({ path: file, fullPage: true });
  console.log(`screen ${name} → ${file}`);

  const source = designOf(name);
  if (!source) {
    await test.info().attach(`${name}.png`, { path: file });
    return { file, check: null };
  }

  const designFile = `${base}-design.png`;
  const design = await drawDesign(page, source, designFile);
  const check = compareLooks(
    design,
    await page.evaluate(readLook),
    await stockSteps(page),
  );
  writeFileSync(`${base}.design.json`, `${JSON.stringify(check, null, 2)}\n`);

  await test.info().attach(`${name}-expected.png`, { path: designFile });
  await test.info().attach(`${name}-actual.png`, { path: file });
  await test.info().attach(`${name}: built against the design`, {
    body: describeCheck(name, check),
    contentType: "text/plain",
  });
  return { file, check };
}

/**
 * Draws the screen and fails when a text looks different from its design:
 * a color, a type size or weight, a radius, a border, a padding or the
 * height of a control. A size is a difference when a stock Tailwind step is
 * nearer to the design than the built value is. The failure lists each
 * difference with the value of the design, the built value and that step.
 */
export async function expectDesign(page: Page, name: string): Promise<void> {
  const { check } = await shot(page, name);
  if (!check) {
    throw new Error(`docs/designs has no ${name}.dc.html to compare with.`);
  }
  expect(check.differences, describeCheck(name, check)).toEqual([]);
}
