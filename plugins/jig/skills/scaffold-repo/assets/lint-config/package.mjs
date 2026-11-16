import { gates } from "./gates.mjs";
import { jigPlugin } from "./next.mjs";

/**
 * The oxlint config of a package with its code in `src/`: the jig lint gates
 * over that folder. A warning fails the run (`denyWarnings`).
 */
export default {
  plugins: ["typescript", "react", "import", "jsx-a11y"],
  jsPlugins: [jigPlugin],
  categories: { correctness: "off" },
  options: { denyWarnings: true },
  ignorePatterns: ["dist/**", "coverage/**"],
  overrides: gates(["src"]),
};
