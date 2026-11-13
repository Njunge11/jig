/** One visible piece of text of a page, with the look the browser computed for it. */
export type TextLook = {
  /** The text as the person reads it: `text-transform` is applied. */
  text: string;
  /** Where the text starts on the page, to pair two texts that read the same. */
  x: number;
  y: number;
  /** Property name to computed value: `color`, `font-size`, `box radius`. */
  look: Record<string, string>;
};

/**
 * Reads the look of each visible piece of text of the page it runs in:
 * `page.evaluate(readLook)`. It runs in the browser, so it uses nothing
 * outside its own body.
 *
 * The look is the computed style, not the CSS that gave it: a design drawn
 * with its own class names and a screen built with Tailwind give the same
 * values when they look the same. A color is read as the browser paints it,
 * so `#1c3a6e`, `rgb(28 58 110)` and an `oklch()` of the same color are
 * equal.
 *
 * The box of a text is the nearest element that paints one: a background,
 * a border or a shadow. It is the button of a label and the card of a title.
 * A box of 64 px or less in height is a control: its height, its icon and
 * the place of the text in it are part of the look. The height of a taller
 * box follows its content, which is sample data in a design.
 *
 * Not read: the shape of an icon, the space between two blocks, the width
 * of a table column and the look of a text that only one screen shows (a
 * row of data). The two screenshots show those.
 */
export function readLook(): TextLook[] {
  const SIDES = ["Top", "Right", "Bottom", "Left"] as const;
  const CORNERS = ["TopLeft", "TopRight", "BottomRight", "BottomLeft"] as const;
  const COLOR =
    /(?:rgba?|hsla?|oklch|oklab|lab|lch|color)\([^()]*(?:\([^()]*\)[^()]*)*\)|#[0-9a-f]{3,8}\b/gi;
  const CONTROL_HEIGHT = 64;

  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) throw new Error("The page gives no 2d canvas to read a color.");

  /** The red, green, blue and alpha the browser paints for a CSS color. */
  const painted = (color: string): number[] => {
    context.clearRect(0, 0, 1, 1);
    context.fillStyle = "#000";
    context.fillStyle = color;
    context.fillRect(0, 0, 1, 1);
    return Array.from(context.getImageData(0, 0, 1, 1).data);
  };
  const alphaOf = (color: string) => painted(color)[3] ?? 0;
  const hex = (rgba: number[]): string => {
    const [r = 0, g = 0, b = 0, a = 255] = rgba;
    const value = [r, g, b]
      .map((n) => n.toString(16).padStart(2, "0"))
      .join("");
    return a < 255
      ? `#${value} at ${Math.round((a / 255) * 100)}%`
      : `#${value}`;
  };
  const colorOf = (color: string) => hex(painted(color));
  const px = (value: number) => `${Math.round(value * 10) / 10}px`;
  const length = (value: string) =>
    value.endsWith("px") ? px(parseFloat(value)) : value;

  /** The color behind an element: each background from the page up to it. */
  const behind = (element: Element): string => {
    const layers: number[][] = [];
    for (let node: Element | null = element; node; node = node.parentElement) {
      const layer = painted(getComputedStyle(node).backgroundColor);
      if ((layer[3] ?? 0) > 0) layers.push(layer);
      if (layer[3] === 255) break;
    }
    let color = [255, 255, 255];
    for (const layer of layers.reverse()) {
      const alpha = (layer[3] ?? 0) / 255;
      color = color.map((under, i) =>
        Math.round((layer[i] ?? 0) * alpha + under * (1 - alpha)),
      );
    }
    return hex([...color, 255]);
  };

  const borderOf = (
    style: CSSStyleDeclaration,
    side: (typeof SIDES)[number],
  ) => {
    const width = parseFloat(style[`border${side}Width`]);
    const color = style[`border${side}Color`];
    return width > 0 && alphaOf(color) > 0
      ? `${px(width)} ${colorOf(color)}`
      : "0px";
  };

  const paintsBox = (style: CSSStyleDeclaration): boolean =>
    alphaOf(style.backgroundColor) > 0 ||
    style.boxShadow !== "none" ||
    SIDES.some((side) => borderOf(style, side) !== "0px");

  const boxOf = (element: Element): Element => {
    for (
      let node: Element | null = element;
      node && node !== document.documentElement;
      node = node.parentElement
    ) {
      if (paintsBox(getComputedStyle(node))) return node;
    }
    return document.body;
  };

  const isField = (element: Element) =>
    element instanceof HTMLInputElement ||
    element instanceof HTMLTextAreaElement ||
    element instanceof HTMLSelectElement;

  const textOf = (element: Element): string => {
    if (
      element instanceof HTMLInputElement ||
      element instanceof HTMLTextAreaElement
    ) {
      return element.placeholder;
    }
    if (element instanceof HTMLSelectElement) {
      return element.selectedOptions[0]?.textContent ?? "";
    }
    // React writes `{label}: {value}` as text nodes with nothing between
    // them. A child element stands between two words.
    return Array.from(element.childNodes)
      .map((node) =>
        node.nodeType === Node.TEXT_NODE ? (node.textContent ?? "") : " ",
      )
      .join("");
  };

  /** Where the letters are: the box of the text itself, not of its element. */
  const lettersOf = (element: Element): DOMRect => {
    const range = document.createRange();
    for (const node of Array.from(element.childNodes)) {
      if (node.nodeType !== Node.TEXT_NODE || !node.textContent?.trim())
        continue;
      range.selectNodeContents(node);
      return range.getBoundingClientRect();
    }
    return element.getBoundingClientRect();
  };

  /** The shadows that paint: a framework adds layers with no color. */
  const shadowOf = (shadow: string): string => {
    const layers = shadow
      .replace(COLOR, colorOf)
      .split(/,\s*(?=#)/)
      .filter((layer) => !layer.includes(" at 0%"));
    return layers.length > 0 ? layers.join(", ") : "none";
  };

  /** The size and the color of the icon a control shows beside its text. */
  const iconOf = (control: Element): string => {
    const icon = Array.from(control.querySelectorAll("svg")).find(
      (svg) => svg.getBoundingClientRect().width > 0,
    );
    if (!icon) return "none";
    const style = getComputedStyle(icon);
    const paint = style.stroke !== "none" ? style.stroke : style.fill;
    return `${px(icon.getBoundingClientRect().width)} ${colorOf(paint)}`;
  };

  const SKIPPED = ["SCRIPT", "STYLE", "NOSCRIPT", "OPTION", "TEMPLATE"];
  const records: TextLook[] = [];
  /** Where each text is, to find the first text of each line of a box. */
  const placed: {
    record: TextLook;
    box: Element;
    left: number;
    top: number;
    bottom: number;
    inTable: boolean;
    control: boolean;
  }[] = [];
  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_ELEMENT,
  );
  for (
    let node: Node | null = walker.currentNode;
    node;
    node = walker.nextNode()
  ) {
    if (!(node instanceof Element) || SKIPPED.includes(node.tagName)) continue;
    const style = getComputedStyle(node);
    let text = textOf(node).replace(/\s+/g, " ").trim();
    if (style.textTransform === "uppercase") text = text.toUpperCase();
    if (style.textTransform === "lowercase") text = text.toLowerCase();
    if (!text) continue;
    // A text for screen readers only is 1 px wide: the person does not see it.
    const rect = node.getBoundingClientRect();
    if (rect.width <= 1 || rect.height <= 1) continue;
    if (
      !node.checkVisibility({ opacityProperty: true, visibilityProperty: true })
    ) {
      continue;
    }

    const letters = lettersOf(node);
    const left = isField(node)
      ? rect.x +
        parseFloat(style.borderLeftWidth) +
        parseFloat(style.paddingLeft)
      : letters.x;
    const x = Math.round(left + window.scrollX);
    const look: Record<string, string> = {
      color: colorOf(style.color),
      "font-size": length(style.fontSize),
      "font-weight": style.fontWeight,
      "font-family": (style.fontFamily.split(",")[0] ?? "")
        .replace(/["']/g, "")
        .trim(),
      "line-height": length(style.lineHeight),
      "letter-spacing": length(style.letterSpacing),
      "text-decoration": style.textDecorationLine,
      "font-style": style.fontStyle,
    };
    const box = boxOf(node);
    const boxStyle = getComputedStyle(box);
    // An opaque box is the color behind its text: one line says it.
    if (box === document.body || alphaOf(boxStyle.backgroundColor) < 255) {
      look["color behind the text"] = behind(node);
    }
    if (box !== document.body) {
      const boxRect = box.getBoundingClientRect();
      const round = Math.min(boxRect.width, boxRect.height) / 2;
      look["box background"] = colorOf(boxStyle.backgroundColor);
      look["box border"] = SIDES.map((side) => borderOf(boxStyle, side)).join(
        ", ",
      );
      look["box radius"] = CORNERS.map((corner) => {
        const radius = parseFloat(boxStyle[`border${corner}Radius`]);
        return radius >= round ? "round" : px(radius);
      }).join(" ");
      look["box shadow"] = shadowOf(boxStyle.boxShadow);
      if (boxRect.height <= CONTROL_HEIGHT) {
        look["box height"] = px(boxRect.height);
        look["icon in the box"] = iconOf(box);
      }
    }
    const record = {
      text,
      x,
      y: Math.round(letters.y + window.scrollY),
      look,
    };
    records.push(record);
    placed.push({
      record,
      box,
      left,
      top: letters.top,
      bottom: letters.bottom,
      inTable: node.closest("table, [role=table], [role=grid]") !== null,
      control:
        box !== document.body &&
        box.getBoundingClientRect().height <= CONTROL_HEIGHT,
    });
  }

  // The place of a text is part of its look when the text starts a line of
  // its box. Data moves a text that comes after it on the line: a count of
  // 5 or of 12 before the next tab. The width of a table column follows its
  // data too.
  for (const text of placed) {
    const startsItsLine = !placed.some(
      (other) =>
        other !== text &&
        other.box === text.box &&
        other.left < text.left &&
        other.top < text.bottom &&
        other.bottom > text.top,
    );
    if (!startsItsLine || text.inTable) continue;
    text.record.look["distance from the left of the page"] =
      `${text.record.x}px`;
    if (text.control) {
      text.record.look["text from the left of its box"] = px(
        text.left - text.box.getBoundingClientRect().x,
      );
    }
  }
  return records;
}
