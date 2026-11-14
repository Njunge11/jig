import tseslint from "typescript-eslint";

/**
 * The lint gate of the end-to-end tests. Playwright's best practices name
 * one rule: a Playwright call with no `await` passes without running, and
 * `no-floating-promises` refuses it.
 *
 * A flow sets no time limit of its own. `flowSteps` gives a test the limit
 * of the config for each step, so a step that hangs fails in that time. A
 * raised limit of a test hides the hang for the length of that limit.
 */
const NO_LIMIT =
  "A flow sets no time limit: each step of flowSteps has the limit of the config (support/steps.ts). Make two steps of a step that needs more time.";
export default tseslint.config(
  { ignores: [".output/**", "node_modules/**", "eslint.config.mjs"] },
  {
    files: ["**/*.ts"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: { "@typescript-eslint": tseslint.plugin },
    rules: { "@typescript-eslint/no-floating-promises": "error" },
  },
  {
    files: ["flows/**/*.ts"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "CallExpression[callee.object.name='test'][callee.property.name=/^(setTimeout|slow)$/]",
          message: NO_LIMIT,
        },
        {
          selector:
            "CallExpression[callee.property.name='setTimeout'][callee.object.type='CallExpression'][callee.object.callee.property.name='info']",
          message: NO_LIMIT,
        },
        {
          selector:
            "CallExpression[callee.property.name='configure'] > ObjectExpression > Property[key.name='timeout']",
          message: NO_LIMIT,
        },
        {
          selector:
            "CallExpression[callee.object.name='test'][callee.property.name='step'] > ObjectExpression > Property[key.name='timeout']",
          message: NO_LIMIT,
        },
      ],
    },
  },
);
