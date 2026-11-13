import tseslint from "typescript-eslint";

/**
 * The lint gate of the end-to-end tests. Playwright's best practices name
 * one rule: a Playwright call with no `await` passes without running, and
 * `no-floating-promises` refuses it.
 */
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
);
