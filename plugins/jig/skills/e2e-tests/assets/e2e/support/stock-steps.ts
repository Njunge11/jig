import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

import type { Page } from "@playwright/test";
import { compile } from "@tailwindcss/node";

import { themeCss } from "./apps";

/**
 * What the stock Tailwind classes give in this app. The app is built with
 * stock classes only, so a value of the design that no class gives is built
 * with the nearest class. The design check accepts that class.
 *
 * No value is written here. The names of the steps come from Tailwind's own
 * theme file, Tailwind compiles each class with the theme of the app, and
 * the browser computes what the class gives.
 */
export type StockSteps = {
  /** What each `text-*` class gives, in px. */
  fontSizes: number[];
  /** What each `rounded-*` class gives, in px. */
  radii: number[];
  /** What each `tracking-*` class gives, in em. */
  trackings: number[];
  /** One step of the spacing scale (`h-1`, `p-1`), in px. */
  spacing: number;
};

/** The step names of one scale, from the keys of Tailwind's theme file. */
function namesOf(theme: string, scale: string): string[] {
  const key = new RegExp(`^\\s*--${scale}-([a-z0-9]+):`, "gm");
  return [...theme.matchAll(key)].flatMap((match) => match[1] ?? []);
}

async function read(page: Page): Promise<StockSteps> {
  const require = createRequire(import.meta.url);
  const theme = readFileSync(require.resolve("tailwindcss/theme.css"), "utf8");
  const classes = {
    fontSizes: namesOf(theme, "text").map((name) => `text-${name}`),
    radii: namesOf(theme, "radius").map((name) => `rounded-${name}`),
    trackings: namesOf(theme, "tracking").map((name) => `tracking-${name}`),
    spacing: ["h-1"],
  };

  const compiler = await compile(readFileSync(themeCss, "utf8"), {
    base: path.dirname(themeCss),
    onDependency() {},
  });
  const css = compiler.build(Object.values(classes).flat());

  const probe = await page.context().newPage();
  try {
    await probe.setContent(`<style>${css}</style>`);
    return await probe.evaluate((names) => {
      // 100 px of type: a letter spacing in px is then its em value times 100.
      const TYPE = 100;
      const computed = (name: string) => {
        const element = document.createElement("div");
        element.style.fontSize = `${TYPE}px`;
        element.className = name;
        document.body.append(element);
        return getComputedStyle(element);
      };
      const px = (value: string) => parseFloat(value) || 0;
      return {
        fontSizes: names.fontSizes.map((name) => px(computed(name).fontSize)),
        radii: names.radii.map((name) =>
          px(computed(name).borderTopLeftRadius),
        ),
        trackings: names.trackings.map(
          (name) => px(computed(name).letterSpacing) / TYPE,
        ),
        spacing: px(computed("h-1").height),
      };
    }, classes);
  } finally {
    await probe.close();
  }
}

let steps: Promise<StockSteps> | undefined;

/** The stock steps of the app, read one time per worker. */
export function stockSteps(page: Page): Promise<StockSteps> {
  steps ??= read(page);
  return steps;
}
