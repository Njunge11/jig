import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

import { gates } from "./gates.mjs";

/** The trees of a Next.js app that the jig gates apply to (structure skill). */
const APP_TREES = ["app", "features", "lib", "components", "test"];

/**
 * The ESLint config of every Next.js app in this repo: eslint-config-next,
 * then the jig lint gates over the app's trees.
 */
export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
    },
  },
  ...gates(APP_TREES, { pages: ["app/**/page.tsx"] }),
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "coverage/**",
    "next-env.d.ts",
  ]),
]);
