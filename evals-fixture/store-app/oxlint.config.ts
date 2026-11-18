import { fileURLToPath } from "node:url";

import { defineConfig, type OxlintConfig } from "oxlint";

// The jig rules as an oxlint JS plugin (oxlint docs, "JS Plugins"): every
// rule id reads jig/<name>.
const jigPlugin = fileURLToPath(
  new URL("./lint-rules/plugin.mjs", import.meta.url),
);

/**
 * The rules of a Next.js app (the Core Web Vitals set and the TypeScript set),
 * as the oxlint migration tool (`@oxlint/migrate`) maps them to native oxlint
 * rules.
 */
const nextRules: OxlintConfig["rules"] = {
  "no-array-constructor": "error",
  "no-unused-expressions": "warn",
  "no-unused-vars": [
    "warn",
    {
      argsIgnorePattern: "^_",
      varsIgnorePattern: "^_",
      destructuredArrayIgnorePattern: "^_",
      caughtErrorsIgnorePattern: "^_",
    },
  ],
  "nextjs/google-font-display": "warn",
  "nextjs/google-font-preconnect": "warn",
  "nextjs/next-script-for-ga": "warn",
  "nextjs/no-async-client-component": "warn",
  "nextjs/no-before-interactive-script-outside-document": "warn",
  "nextjs/no-css-tags": "warn",
  "nextjs/no-head-element": "warn",
  "nextjs/no-html-link-for-pages": "error",
  "nextjs/no-img-element": "warn",
  "nextjs/no-page-custom-font": "warn",
  "nextjs/no-styled-jsx-in-document": "warn",
  "nextjs/no-sync-scripts": "error",
  "nextjs/no-title-in-document-head": "warn",
  "nextjs/no-typos": "warn",
  "nextjs/no-unwanted-polyfillio": "warn",
  "nextjs/inline-script-id": "error",
  "nextjs/no-assign-module-variable": "error",
  "nextjs/no-document-import-in-page": "error",
  "nextjs/no-duplicate-head": "error",
  "nextjs/no-head-import-in-document": "error",
  "nextjs/no-script-component-in-head": "error",
  "typescript/ban-ts-comment": "error",
  "typescript/no-duplicate-enum-values": "error",
  "typescript/no-empty-object-type": "error",
  "typescript/no-explicit-any": "error",
  "typescript/no-extra-non-null-assertion": "error",
  "typescript/no-misused-new": "error",
  "typescript/no-namespace": "error",
  "typescript/no-non-null-asserted-optional-chain": "error",
  "typescript/no-require-imports": "error",
  "typescript/no-this-alias": "error",
  "typescript/no-unnecessary-type-constraint": "error",
  "typescript/no-unsafe-declaration-merging": "error",
  "typescript/no-unsafe-function-type": "error",
  "typescript/no-wrapper-object-types": "error",
  "typescript/prefer-as-const": "error",
  "typescript/prefer-namespace-keyword": "error",
  "typescript/triple-slash-reference": "error",
  "react/display-name": "error",
  "react/jsx-key": "error",
  "react/jsx-no-comment-textnodes": "error",
  "react/jsx-no-duplicate-props": "error",
  "react/jsx-no-target-blank": "off",
  "react/jsx-no-undef": "error",
  "react/no-children-prop": "error",
  "react/no-danger-with-children": "error",
  "react/no-direct-mutation-state": "error",
  "react/no-find-dom-node": "error",
  "react/no-is-mounted": "error",
  "react/no-render-return-value": "error",
  "react/no-string-refs": "error",
  "react/no-unescaped-entities": "error",
  "react/no-unknown-property": "off",
  "react/no-unsafe": "off",
  "react/react-in-jsx-scope": "off",
  "import/no-anonymous-default-export": "warn",
  "jsx-a11y/alt-text": ["warn", { elements: ["img"], img: ["Image"] }],
  "jsx-a11y/aria-props": "warn",
  "jsx-a11y/aria-proptypes": "warn",
  "jsx-a11y/aria-unsupported-elements": "warn",
  "jsx-a11y/role-has-required-aria-props": "warn",
  "jsx-a11y/role-supports-aria-props": "warn",
  "react/rules-of-hooks": "error",
  "react/exhaustive-deps": "warn",
  "react/static-components": "error",
  "react/use-memo": "error",
  "react/preserve-manual-memoization": "error",
  "react/incompatible-library": "warn",
  "react/immutability": "error",
  "react/globals": "error",
  "react/refs": "error",
  "react/set-state-in-effect": "error",
  "react/error-boundaries": "error",
  "react/purity": "error",
  "react/set-state-in-render": "error",
  "react/unsupported-syntax": "warn",
};

/** The rules that TypeScript itself checks are off for a TypeScript file. */
const typescriptFileRules: OxlintConfig["rules"] = {
  "constructor-super": "off",
  "getter-return": "off",
  "no-class-assign": "off",
  "no-const-assign": "off",
  "no-dupe-class-members": "off",
  "no-dupe-keys": "off",
  "no-func-assign": "off",
  "no-import-assign": "off",
  "no-new-native-nonconstructor": "off",
  "no-obj-calls": "off",
  "no-redeclare": "off",
  "no-setter-return": "off",
  "no-this-before-super": "off",
  "no-unreachable": "off",
  "no-unsafe-negation": "off",
  "no-var": "error",
  "no-with": "off",
  "prefer-const": "error",
  "prefer-rest-params": "error",
  "prefer-spread": "error",
};

// The jig gate rules apply to the trees the jig structure skill places code in.
// components/ui is shadcn CLI output (regenerate, never edit) and stays out.
const v2Trees = ["app", "features", "agent", "channels", "evals"];
const v2Glob = (suffix: string) => v2Trees.map((tree) => `${tree}/${suffix}`);

// Backend globs for docs/lint-gates.md rows 19, 23, 24, 25 (backend-standards).
// `.tsx` files are excluded on purpose; tests and fixtures are excluded too.
const backendGlobFiles = v2Glob("**/*.ts");
const testIgnores = [
  "**/*.test.ts",
  "**/*.test.tsx",
  "**/__tests__/**",
  "**/__fixtures__/**",
];

// Messages below cite the docs/lint-gates.md row they gate, e.g. "backend-standards 10".
const factoryReturnsFunctionSelector = {
  selector:
    "ReturnStatement > :matches(ArrowFunctionExpression, FunctionExpression)",
  message:
    "backend-standards 23: function returns a function to bind a dependency.",
};
const factoryMethodBodySelector = {
  selector:
    'ReturnStatement > ObjectExpression > Property > :matches(ArrowFunctionExpression, FunctionExpression)[body.type="BlockStatement"]',
  message:
    "backend-standards 24: factory writes a method body inside the returned object.",
};
const inlineMultilineCallbackSelector = {
  selector:
    'CallExpression[callee.name!=/^(it|test|describe|beforeEach|afterEach|beforeAll|afterAll)$/] > ArrowFunctionExpression[body.type="BlockStatement"][body.body.length>1]',
  message:
    "backend-standards 25: multi-line inline function as a call argument.",
};
const forcedAssertionSelectors = [
  {
    selector: 'TSAsExpression[typeAnnotation.type="TSNeverKeyword"]',
    message:
      "backend-standards 31 / frontend-standards 64: `as never` forces a type; type the value at its source.",
  },
  {
    selector:
      'TSAsExpression[expression.type="TSAsExpression"][expression.typeAnnotation.type=/^TS(Any|Unknown)Keyword$/]',
    message:
      "backend-standards 31 / frontend-standards 64: double assertion (`as unknown as T`) forces a type; type the value at its source.",
  },
];
const backendGlobSyntaxSelectors = [
  ...forcedAssertionSelectors,
  factoryReturnsFunctionSelector,
  factoryMethodBodySelector,
  inlineMultilineCallbackSelector,
];

const trpcReactQueryPath = {
  name: "@trpc/react-query",
  message:
    "frontend-standards 34: use @trpc/tanstack-react-query, not the legacy wiring.",
};

const mocksOwnModuleSelector = {
  selector:
    'CallExpression[callee.object.name="vi"][callee.property.name="mock"][arguments.0.value=/^[.@]/]',
  message: "backend-tests 6: mocks our own repo or service.",
};

const tsxSyntaxSelectors = [
  {
    selector:
      'JSXElement[openingElement.name.name="Button"]:not(:has(JSXOpeningElement > JSXAttribute[name.name="asChild"])) > JSXElement[openingElement.name.name="Link"]',
    message: "frontend-standards 9: use asChild for a Button that is a Link.",
  },
  {
    selector:
      'JSXAttribute[name.name="className"] > JSXExpressionContainer > TemplateLiteral',
    message:
      "frontend-standards 14: no template-literal class names; use cn().",
  },
  {
    selector:
      'CallExpression[callee.name="useEveAgent"] > ObjectExpression:has(> Property[key.name="initialSession"]):not(:has(> Property[key.name="resume"]))',
    message: "eve-agent 9: useEveAgent resumes without resume: true.",
  },
];

// A warning fails the run (`denyWarnings`). A later entry replaces the options
// of a rule that an earlier entry set for the same file.
export default defineConfig({
  plugins: ["nextjs", "typescript", "react", "import", "jsx-a11y"],
  jsPlugins: [jigPlugin],
  categories: { correctness: "off" },
  env: { builtin: true, browser: true, node: true },
  options: { denyWarnings: true },
  ignorePatterns: [
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "coverage/**",
    "components/ui/**",
    "hooks/use-mobile.ts",
    // withWorkflow writes its generated routes here.
    "app/.well-known/**",
  ],
  rules: nextRules,
  overrides: [
    {
      files: ["**/*.ts", "**/*.tsx", "**/*.mts", "**/*.cts"],
      rules: typescriptFileRules,
    },

    // --- docs/lint-gates.md frontend-standards 21, 23, 27, 28 (v2 trees only) ---
    // Native oxlint rules, switched on / raised to error.
    {
      files: [...v2Glob("**/*.ts"), ...v2Glob("**/*.tsx")],
      rules: {
        "react/no-deriving-state-in-effects": "error",
        "react/exhaustive-deps": "error",
        "jsx-a11y/control-has-associated-label": "error",
        "jsx-a11y/label-has-associated-control": "error",
      },
    },

    // --- docs/lint-gates.md backend-standards 31 / frontend-standards 64 (v2 `.ts`, tests ignored) ---
    // Every later `no-restricted-syntax` entry for a `.ts` glob folds
    // `forcedAssertionSelectors` back in through `backendGlobSyntaxSelectors`;
    // this entry covers the `.ts` files no narrower entry claims (UI modules,
    // routers, app code).
    {
      files: v2Glob("**/*.ts"),
      excludeFiles: testIgnores,
      rules: {
        "jig/restricted-syntax": ["error", ...forcedAssertionSelectors],
      },
    },

    // --- docs/lint-gates.md frontend-standards 34 (v2 trees only) ---
    // Kept ahead of the backend-specific no-restricted-imports entries below:
    // every one of those globs (`**/*.service.ts`, `**/*.repo.ts`, ...) is
    // also `**/*.ts`, and each folds this restriction back in so it survives
    // the per-rule, per-file override when configs overlap.
    {
      files: [...v2Glob("**/*.ts"), ...v2Glob("**/*.tsx")],
      rules: {
        "no-restricted-imports": ["error", { paths: [trpcReactQueryPath] }],
      },
    },

    // --- docs/lint-gates.md backend-standards 19, 23, 24, 25 (v2 trees only) ---
    // The broadest backend-code tier. Files under `**/*.service.ts`,
    // `**/*.repo.ts`, `**/*.repository.ts` and `agent/tools/**/*.ts` overlap
    // this glob set (e.g. `features/x.service.ts` matches `features/**/*.ts`);
    // those narrower entries below fold these three selectors back in so
    // nothing is lost to the per-rule, per-file override when configs
    // overlap.
    {
      files: backendGlobFiles,
      excludeFiles: [
        ...testIgnores,
        "features/**/ui/**",
        "channels/**/ui/**",
        "components/ui/chat/**",
        "app/**",
      ],
      rules: {
        "jig/restricted-syntax": ["error", ...backendGlobSyntaxSelectors],
        "no-empty": ["error", { allowEmptyCatch: false }],
      },
    },

    // --- docs/lint-gates.md backend-standards 2, 10, 11, 14, 16 (service.ts) ---
    {
      files: v2Glob("**/*.service.ts"),
      excludeFiles: testIgnores,
      rules: {
        "jig/restricted-syntax": [
          "error",
          {
            selector: "ClassDeclaration",
            message:
              "backend-standards 2: service or repo must not be a class or a singleton.",
          },
          {
            selector: 'CallExpression[callee.property.name="transaction"]',
            message:
              "backend-standards 11: repo holds business logic, validation, or starts a transaction.",
          },
          {
            selector:
              'CallExpression[callee.property.name="select"][arguments.length=0]',
            message:
              "backend-standards 16: SELECT * — pass explicit columns to .select().",
          },
          ...backendGlobSyntaxSelectors,
        ],
        "no-await-in-loop": "error",
        "no-restricted-imports": [
          "error",
          {
            paths: [
              {
                name: "drizzle-orm",
                message: "backend-standards 10: service holds SQL concerns.",
              },
              {
                name: "@trpc/server",
                message: "backend-standards 10: service holds tRPC concerns.",
              },
              {
                name: "@/db/client",
                message:
                  "backend-standards 2: a lower layer must not import the db client directly.",
              },
              trpcReactQueryPath,
            ],
          },
        ],
      },
    },

    // --- docs/lint-gates.md backend-standards 2, 11, 14, 16 (repo.ts / repository.ts) ---
    {
      files: [...v2Glob("**/*.repo.ts"), ...v2Glob("**/*.repository.ts")],
      excludeFiles: testIgnores,
      rules: {
        "jig/restricted-syntax": [
          "error",
          {
            selector: "ClassDeclaration",
            message:
              "backend-standards 2: service or repo must not be a class or a singleton.",
          },
          {
            selector: 'CallExpression[callee.property.name="transaction"]',
            message:
              "backend-standards 11: repo holds business logic, validation, or starts a transaction.",
          },
          {
            selector:
              'CallExpression[callee.property.name="select"][arguments.length=0]',
            message:
              "backend-standards 16: SELECT * — pass explicit columns to .select().",
          },
          ...backendGlobSyntaxSelectors,
        ],
        "no-await-in-loop": "error",
        "no-restricted-imports": [
          "error",
          {
            paths: [
              {
                name: "@/db/client",
                message:
                  "backend-standards 2: a lower layer must not import the db client directly.",
              },
              trpcReactQueryPath,
            ],
          },
        ],
      },
    },

    // --- docs/lint-gates.md backend-standards 3 (router.ts entry point) ---
    {
      files: v2Glob("**/*.router.ts"),
      rules: {
        "no-restricted-imports": [
          "error",
          {
            paths: [
              {
                name: "drizzle-orm",
                message:
                  "backend-standards 3: entry point must not query the DB directly; hand db to a repo factory.",
              },
              trpcReactQueryPath,
            ],
          },
        ],
      },
    },

    // --- docs/lint-gates.md backend-standards 3, 26 and eve-agent new (agent/tools) ---
    {
      files: ["agent/tools/**/*.ts"],
      excludeFiles: testIgnores,
      rules: {
        "jig/restricted-syntax": [
          "error",
          {
            selector:
              'CallExpression[callee.name="defineTool"] > ObjectExpression > Property[key.name="execute"][value.type!="Identifier"]',
            message:
              "backend-standards 26: eve tool execute must be a module-scope identifier.",
          },
          {
            selector:
              // A spread config (`{ ...GET_ORDER_CONFIG, execute }`) is skipped: the selector cannot see inside it.
              'CallExpression[callee.name="defineTool"] > ObjectExpression:not(:has(> Property[key.name="outputSchema"])):not(:has(> SpreadElement))',
            message:
              "eve-agent new: a tool whose raw output a client, hook or mapping reads needs an outputSchema.",
          },
          ...backendGlobSyntaxSelectors,
        ],
        "no-restricted-imports": [
          "error",
          {
            paths: [
              {
                name: "drizzle-orm",
                message:
                  "backend-standards 3: entry point must not query the DB directly; hand db to a repo factory.",
              },
              trpcReactQueryPath,
            ],
          },
        ],
      },
    },

    // --- docs/lint-gates.md frontend-standards 3 (v2 trees only; folds frontend-standards 34) ---
    {
      files: v2Glob("**/*.tsx"),
      rules: {
        "no-restricted-imports": [
          "error",
          {
            patterns: [
              {
                group: ["@base-ui-components/*"],
                message:
                  "frontend-standards 3: use Radix as the one primitive library.",
              },
              {
                group: ["@headlessui/*"],
                message:
                  "frontend-standards 3: use Radix as the one primitive library.",
              },
              {
                group: ["@mui/*"],
                message:
                  "frontend-standards 3: use Radix as the one primitive library.",
              },
            ],
            paths: [
              {
                name: "react-aria-components",
                message:
                  "frontend-standards 3: use Radix as the one primitive library.",
              },
              trpcReactQueryPath,
            ],
          },
        ],
      },
    },

    // --- docs/lint-gates.md frontend-standards 9, 14 and eve-agent 9 (v2 trees, **/*.tsx) ---
    // Also matches `**/*.test.tsx`; the test-file entry below folds these
    // selectors back in so the override doesn't drop them there.
    {
      files: v2Glob("**/*.tsx"),
      rules: {
        "jig/restricted-syntax": ["error", ...tsxSyntaxSelectors],
      },
    },

    // --- docs/lint-gates.md backend-standards 31 / frontend-standards 64 (v2 `.tsx`, tests ignored) ---
    {
      files: v2Glob("**/*.tsx"),
      excludeFiles: testIgnores,
      rules: {
        "jig/restricted-syntax": [
          "error",
          ...tsxSyntaxSelectors,
          ...forcedAssertionSelectors,
        ],
      },
    },

    // --- docs/lint-gates.md backend-tests 1, 3, 5, 6, 9, 14 (**/*.test.ts) ---
    {
      files: v2Glob("**/*.test.ts"),
      rules: {
        "jig/restricted-syntax": [
          "error",
          {
            selector:
              "CallExpression[callee.property.name=/^toHaveBeenCalled/]",
            message:
              "backend-tests 1: asserts an internal call, toHaveBeenCalled.",
          },
          {
            selector: 'CallExpression[callee.property.name="toBeDefined"]',
            message:
              "backend-tests 3: no setup, invocation, or specific assertion; toBeDefined.",
          },
          {
            selector:
              'NewExpression[callee.name="Date"][arguments.length=0], CallExpression[callee.object.name="Math"][callee.property.name="random"]',
            message: "backend-tests 5: reads the clock or randomness.",
          },
          mocksOwnModuleSelector,
          {
            selector:
              'CallExpression[callee.name="it"] BlockStatement > :matches(ForStatement, ForOfStatement, ForInStatement, WhileStatement, IfStatement)',
            message: "backend-tests 9: poor name; logic in the body.",
          },
          {
            selector: "CallExpression[callee.property.name=/^toBeLessThan/]",
            message:
              "backend-tests 14: budget test on a fake; toBeLessThan; count read off the implementation.",
          },
        ],
      },
    },

    // --- docs/lint-gates.md backend-tests 1, 5, 6, 9 (extended) and
    // frontend-tests 3, 5 (**/*.test.tsx). Also folds frontend-standards 9, 14
    // and eve-agent 9 from the **/*.tsx entry above, which this overlaps. ---
    {
      files: v2Glob("**/*.test.tsx"),
      rules: {
        "jig/restricted-syntax": [
          "error",
          {
            selector:
              'JSXElement[openingElement.name.name="Button"]:not(:has(JSXOpeningElement > JSXAttribute[name.name="asChild"])) > JSXElement[openingElement.name.name="Link"]',
            message:
              "frontend-standards 9: use asChild for a Button that is a Link.",
          },
          {
            selector:
              'JSXAttribute[name.name="className"] > JSXExpressionContainer > TemplateLiteral',
            message:
              "frontend-standards 14: no template-literal class names; use cn().",
          },
          {
            selector:
              'CallExpression[callee.name="useEveAgent"] > ObjectExpression:has(> Property[key.name="initialSession"]):not(:has(> Property[key.name="resume"]))',
            message: "eve-agent 9: useEveAgent resumes without resume: true.",
          },
          {
            selector:
              "CallExpression[callee.property.name=/^toHaveBeenCalled/]",
            message:
              "backend-tests 1: asserts an internal call, toHaveBeenCalled.",
          },
          {
            selector:
              'NewExpression[callee.name="Date"][arguments.length=0], CallExpression[callee.object.name="Math"][callee.property.name="random"]',
            message: "backend-tests 5: reads the clock or randomness.",
          },
          mocksOwnModuleSelector,
          {
            selector:
              'CallExpression[callee.name="it"] BlockStatement > :matches(ForStatement, ForOfStatement, ForInStatement, WhileStatement, IfStatement)',
            message: "backend-tests 9: poor name; logic in the body.",
          },
          {
            selector: 'CallExpression[callee.property.name="toHaveClass"]',
            message: "frontend-tests 3: asserts CSS classes.",
          },
          {
            selector: "CallExpression[callee.property.name=/ByTestId$/]",
            message: "frontend-tests 5: queries by test id.",
          },
        ],
      },
    },

    // --- docs/lint-gates.md §6.1 backend-standards 5 (features/**/workflows) ---
    {
      files: ["features/**/workflows/**/*.ts"],
      rules: {
        "jig/workflow-deterministic": "error",
      },
    },

    // --- docs/lint-gates.md §6.1 backend-tests 10 (v2 trees, __tests__) ---
    {
      files: [
        ...v2Glob("**/__tests__/*.test.ts"),
        ...v2Glob("**/__tests__/*.test.tsx"),
      ],
      rules: {
        "jig/test-named-after-source": "error",
      },
    },

    // --- docs/lint-gates.md §6.1 frontend-standards 16 (v2 trees only) ---
    {
      files: v2Glob("**/*.tsx"),
      rules: {
        "jig/responsive-md-step": "error",
      },
    },

    // --- docs/lint-gates.md §6.1 frontend-standards 50, 54 (app pages) ---
    {
      files: ["app/**/page.tsx"],
      rules: {
        "jig/segment-has-loading-and-error": "error",
      },
    },

    // --- frontend-standards 56: the one handler shows a failed mutation ---
    {
      files: [...v2Glob("**/*.ts"), ...v2Glob("**/*.tsx")],
      excludeFiles: ["lib/trpc/failure.ts"],
      rules: {
        "jig/failure-channel": "error",
      },
    },

    // --- frontend-standards 54: each error file is the shared error page ---
    {
      files: ["app/layout.tsx", "app/**/error.tsx", "app/global-error.tsx"],
      rules: {
        "jig/error-file-is-shared-page": "error",
      },
    },

    // --- docs/lint-gates.md §6.1 eve-agent 5 (agent/agent.ts) ---
    {
      files: ["agent/agent.ts"],
      rules: {
        "jig/default-tools-disabled": "error",
      },
    },
  ],
});
