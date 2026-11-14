import { existsSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

import type { Page } from "@playwright/test";

import { repoRoot } from "./apps";
import { readLook, type TextLook } from "./read-look";
import type { StockSteps } from "./stock-steps";

/**
 * The design of a screen is its source file, `docs/designs/<Screen>.dc.html`:
 * the HTML and CSS of the design artifact. The browser draws it and gives
 * the exact look of each piece of text, so a run compares values, not
 * pictures.
 *
 * The app is built with stock Tailwind classes only. A size of the design
 * that no stock class gives (13 px of type, a radius of 12 px) is built with
 * the nearest stock class, and the check accepts that class: a size is a
 * difference only when a stock step is nearer to the design than the built
 * value is. A color, a weight, a border and a font have no steps: they are
 * equal or they are a difference.
 *
 * A stock type size also changes the width of a text. So a text is in its
 * place when its left edge, its center or its right edge is where the design
 * has it: the text keeps the edge that its layout holds.
 */

const designsDir = path.join(repoRoot, "docs", "designs");

/** The source file of a design, when `docs/designs` holds one of that name. */
export function designOf(name: string): string | null {
  const file = path.join(designsDir, `${name}.dc.html`);
  return existsSync(file) ? file : null;
}

export type Difference = {
  /** The text both screens show. */
  text: string;
  changes: {
    what: string;
    design: string;
    built: string;
    /** The stock step that is nearest to the design, when the built value is not. */
    stock?: string;
  }[];
};

export type DesignCheck = {
  /** The pieces of text that look the same on the two screens. */
  same: number;
  differences: Difference[];
  /** Sample data of the design, or a part that is not built. */
  onlyInDesign: string[];
  /** Real data of the app, or a part that the design does not have. */
  onlyInBuilt: string[];
};

/**
 * What pairs a text of the design with a text of the built screen. A number
 * is data: "22 active" in the design is "8 active" in the app.
 */
function keyOf(text: string): string {
  return text.replace(/\d+/g, "0");
}

function byKey(records: TextLook[]): Map<string, TextLook[]> {
  const map = new Map<string, TextLook[]>();
  for (const record of records) {
    const key = keyOf(record.text);
    map.set(key, [...(map.get(key) ?? []), record]);
  }
  return map;
}

const SAME = { same: true } as const;
type Verdict = typeof SAME | { same: false; stock?: string };

/** The px of `13px`. A value with no length (`normal`, `none`, `round`) has none. */
const pxOf = (value: string): number | null =>
  value.endsWith("px") ? parseFloat(value) : null;
const show = (value: number) => `${Math.round(value * 10) / 10}px`;
const exact = (design: string, built: string): Verdict =>
  design === built ? SAME : { same: false };

/** Two sizes this near are one size: the browser rounds a computed length. */
const HAIR = 0.01;
/** What the look reader gives for a `select` that the browser draws. */
const BROWSER_ARROW = "arrow";

/** The two steps that a value lies between, on a scale with equal steps. */
const around = (value: number, unit: number) => [
  Math.floor(value / unit) * unit,
  Math.ceil(value / unit) * unit,
];

/**
 * A built size is right when no stock step is nearer to the size of the
 * design. 13 px of type lies between `text-xs` and `text-sm`, so the two
 * pass and `text-base` does not.
 */
function onSteps(design: number, built: number, steps: number[]): Verdict {
  const off = Math.min(...steps.map((step) => Math.abs(step - design)));
  if (Math.abs(built - design) <= off + HAIR) return SAME;
  const near = steps.filter((step) => Math.abs(step - design) <= off + HAIR);
  return { same: false, stock: [...new Set(near)].map(show).join(" or ") };
}

type Rule = (
  design: string,
  built: string,
  /** The whole look of the built text: a step can follow its type size. */
  look: Record<string, string>,
  stock: StockSteps,
) => Verdict;

/** A length on a stock scale; a value with no length is equal or different. */
const sized =
  (
    stepsOf: (
      design: number,
      look: Record<string, string>,
      stock: StockSteps,
    ) => number[],
  ): Rule =>
  (design, built, look, stock) => {
    const want = pxOf(design);
    const got = pxOf(built);
    return want === null || got === null
      ? exact(design, built)
      : onSteps(want, got, stepsOf(want, look, stock));
  };

/** A size or a place that a spacing class gives: `h-9`, `size-4.5`, `px-4`. */
const spaced = sized((design, _look, stock) =>
  around(design, stock.spacing / 2),
);

/** `left 277px, center 360px, right 443px` as edge name to px. */
const edgesOf = (place: string): Map<string, number> =>
  new Map(
    place.split(", ").flatMap((part): [string, number][] => {
      const [edge = "", value = ""] = part.split(" ");
      const px = pxOf(value);
      return px === null ? [] : [[edge, px]];
    }),
  );

/**
 * The place of a text: right when no stock class brings one edge that the
 * two screens read nearer to the design. The smallest move of a class is
 * half a spacing unit (`pl-0.5`, 2 px), from where the built text is: a
 * border of 1 px puts a text between two steps of the scale. So an edge is
 * in its place when it is half that move or less from the design. The stock
 * step it names is the nearest place of the left edge that a class gives.
 */
const placed: Rule = (design, built, _look, stock) => {
  const move = stock.spacing / 2;
  const want = edgesOf(design);
  const got = edgesOf(built);
  const edges = [...want].flatMap(([edge, value]) => {
    const other = got.get(edge);
    return other === undefined ? [] : [{ built: other, off: value - other }];
  });
  const [left] = edges;
  if (!left) return exact(design, built);
  if (edges.some((edge) => Math.abs(edge.off) <= move / 2 + HAIR)) return SAME;
  const nearest = left.built + Math.round(left.off / move) * move;
  return { same: false, stock: `${show(nearest)} for the left edge` };
};

const typeSizeOf = (look: Record<string, string>) =>
  pxOf(look["font-size"] ?? "") ?? 0;

/** `normal (19.5px)`: the height that the font gives a line, as the browser used it. */
const usedLineHeight = (value: string) =>
  /^normal \((.+)\)$/.exec(value)?.[1] ?? value;

/** The properties that a stock scale gives. Each other property is exact. */
const RULES: Record<string, Rule> = {
  "font-size": sized((_design, _look, stock) => stock.fontSizes),
  // `leading-<n>` is a step of the spacing scale, and `leading-none` is the
  // type size.
  // A design that sets no line height has the one of its font: the built
  // text has the stock step that is nearest to it, or no line height too.
  "line-height": (design, built, look, stock) =>
    design.startsWith("normal") && built.startsWith("normal")
      ? SAME
      : sized((want, text, steps) => [
          ...around(want, steps.spacing),
          typeSizeOf(text),
        ])(usedLineHeight(design), usedLineHeight(built), look, stock),
  // `tracking-*` is a part of the type size.
  "letter-spacing": (design, built, look, stock) => {
    const length = (value: string) => (value === "normal" ? "0px" : value);
    return sized(() =>
      stock.trackings.map((tracking) => tracking * typeSizeOf(look)),
    )(length(design), length(built), look, stock);
  },
  "box radius": (design, built, look, stock) => {
    const want = design.split(" ");
    const corners = built
      .split(" ")
      .map((corner, i) =>
        sized(() => [0, ...stock.radii])(want[i] ?? "", corner, look, stock),
      );
    const wrong = corners.flatMap((corner) => (corner.same ? [] : [corner]));
    if (wrong.length === 0) return SAME;
    const steps = new Set(wrong.map((corner) => corner.stock));
    return {
      same: false,
      stock: steps.size === 1 ? wrong[0]?.stock : undefined,
    };
  },
  // `h-9`: a whole step. The height of a box follows the line height of its
  // text, and a stock line height is not the line height of the design.
  "box height": sized((design, _look, stock) => around(design, stock.spacing)),
  "place on the page": placed,
  "place in its box": placed,
  // `18px #1c3a6e`: the size is on the spacing scale, the color is exact.
  // A `select` that the browser draws shows the arrow of the browser, and
  // the icon of a built control stands for it: its shape is not compared.
  "icon in the box": (design, built, look, stock) => {
    if (design === BROWSER_ARROW || built === BROWSER_ARROW) {
      return (design === "none") === (built === "none")
        ? SAME
        : { same: false };
    }
    const [wantSize = "", wantColor] = design.split(" ");
    const [gotSize = "", gotColor] = built.split(" ");
    if (wantColor !== gotColor) return { same: false };
    return spaced(wantSize, gotSize, look, stock);
  },
  // Stock Tailwind has no class for the layers of a design's shadow. A box
  // has a shadow or it has none; the two screenshots show the rest.
  "box shadow": (design, built) =>
    (design === "none") === (built === "none") ? SAME : { same: false },
};

function changesOf(
  design: TextLook,
  built: TextLook,
  stock: StockSteps,
): Difference["changes"] {
  return Object.entries(design.look).flatMap(([what, value]) => {
    const other = built.look[what];
    if (other === undefined) return [];
    const rule = RULES[what] ?? exact;
    const verdict = rule(value, other, built.look, stock);
    if (verdict.same) return [];
    return [
      {
        what,
        design: value,
        built: other,
        ...(verdict.stock ? { stock: verdict.stock } : {}),
      },
    ];
  });
}

/**
 * Compares the two screens text by text. A text that a screen shows more
 * than one time (a nav item, a heading and a tab that all read "Deals") is
 * paired with the built one that looks most like it, and then with the one
 * that is nearest to its place.
 */
export function compareLooks(
  design: TextLook[],
  built: TextLook[],
  stock: StockSteps,
): DesignCheck {
  const designTexts = byKey(design);
  const builtTexts = byKey(built);
  const textsOf = (map: Map<string, TextLook[]>, other: Map<string, unknown>) =>
    [...map].flatMap(([key, records]) =>
      other.has(key) ? [] : [...new Set(records.map((record) => record.text))],
    );
  const check: DesignCheck = {
    same: 0,
    differences: [],
    onlyInDesign: textsOf(designTexts, builtTexts),
    onlyInBuilt: textsOf(builtTexts, designTexts),
  };

  for (const [key, wanted] of designTexts) {
    const pairs = wanted
      .flatMap((want) =>
        (builtTexts.get(key) ?? []).map((got) => ({
          want,
          got,
          changes: changesOf(want, got, stock),
          distance: Math.hypot(want.x - got.x, want.y - got.y),
        })),
      )
      .sort(
        (a, b) =>
          a.changes.length - b.changes.length || a.distance - b.distance,
      );
    const paired = new Set<TextLook>();
    for (const { want, got, changes } of pairs) {
      if (paired.has(want) || paired.has(got)) continue;
      paired.add(want).add(got);
      if (changes.length === 0) check.same += 1;
      else check.differences.push({ text: got.text, changes });
    }
  }
  return check;
}

/**
 * Draws the design in a second page of the same browser, at the window size
 * of the built page. Saves its full-page screenshot to `file` and returns
 * the look of each piece of its text.
 */
export async function drawDesign(
  built: Page,
  source: string,
  file: string,
): Promise<TextLook[]> {
  const design = await built.context().newPage();
  try {
    const viewport = built.viewportSize();
    if (viewport) await design.setViewportSize(viewport);
    await design.goto(pathToFileURL(source).href);
    await design.evaluate(() => document.fonts.ready);
    await design.screenshot({ path: file, fullPage: true });
    return await design.evaluate(readLook);
  } finally {
    await design.close();
  }
}

/** The check as the lines a person or an agent reads. */
export function describeCheck(name: string, check: DesignCheck): string {
  const lines = [
    `${name}: ${check.differences.length} texts look different from the design, ${check.same} look the same.`,
  ];
  for (const { text, changes } of check.differences) {
    lines.push("", `"${text}"`);
    for (const { what, design, built, stock } of changes) {
      const step = stock ? `, the nearest stock step is ${stock}` : "";
      lines.push(`  ${what}: design ${design}, built ${built}${step}`);
    }
  }
  const list = (title: string, texts: string[]) => {
    if (texts.length === 0) return;
    lines.push("", title, ...texts.map((text) => `  "${text}"`));
  };
  list(
    "Only in the design (sample data, or a part that is not built):",
    check.onlyInDesign,
  );
  list(
    "Only in the built screen (real data, or a part the design does not have):",
    check.onlyInBuilt,
  );
  return lines.join("\n");
}
