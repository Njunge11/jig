import testNamedAfterSource from "./rules/test-named-after-source.mjs";
import responsiveMdStep from "./rules/responsive-md-step.mjs";
import segmentHasLoadingAndError from "./rules/segment-has-loading-and-error.mjs";

/**
 * The jig lint gates as flat-config entries. Every `pnpm lint` item that the
 * backend-standards, backend-tests and frontend-standards
 * checklists mark "Gate:" is enforced here, and each message cites its item.
 *
 * `gates(trees)` scopes every entry to the given top-level folders, so an app
 * passes its feature trees and a package passes `["src"]`.
 */

const jigPlugin = {
  rules: {
    "test-named-after-source": testNamedAfterSource,
    "responsive-md-step": responsiveMdStep,
    "segment-has-loading-and-error": segmentHasLoadingAndError,
  },
};

const testIgnores = [
  "**/*.test.ts",
  "**/*.test.tsx",
  "**/__tests__/**",
  "**/__fixtures__/**",
];

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
const dbClientPath = {
  name: "{{SCOPE}}/db/client",
  message:
    "backend-standards 2: a lower layer must not import the db client directly.",
};

const mocksOwnModuleSelector = {
  selector:
    'CallExpression[callee.object.name="vi"][callee.property.name="mock"][arguments.0.value=/^([.@]|{{SCOPE}})/]',
  message: "backend-tests 6: mocks our own repo or service.",
};

const layerSyntaxSelectors = [
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
];

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
];

const backendTestSelectors = [
  {
    selector: "CallExpression[callee.property.name=/^toHaveBeenCalled/]",
    message: "backend-tests 1: asserts an internal call, toHaveBeenCalled.",
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
];

/**
 * @param {string[]} trees The top-level folders the gates apply to.
 * @param {{ pages?: string[] }} [options] `pages`: globs of the route files
 *   that need loading.tsx and error.tsx beside them.
 */
export function gates(trees, options = {}) {
  const glob = (suffix) => trees.map((tree) => `${tree}/${suffix}`);
  const tsFiles = glob("**/*.ts");
  const tsxFiles = glob("**/*.tsx");

  return [
    // --- frontend-standards 21, 23, 27, 28: shipped rules raised to error ---
    {
      files: [...tsFiles, ...tsxFiles],
      rules: {
        "react-hooks/exhaustive-deps": "error",
        "jsx-a11y/control-has-associated-label": "error",
        "jsx-a11y/label-has-associated-control": "error",
        "no-restricted-imports": ["error", { paths: [trpcReactQueryPath] }],
      },
    },

    // --- backend-standards 31 / frontend-standards 64 (.ts, tests ignored) ---
    {
      files: tsFiles,
      ignores: testIgnores,
      rules: {
        "no-restricted-syntax": ["error", ...forcedAssertionSelectors],
      },
    },

    // --- backend-standards 19, 23, 24, 25: every backend .ts file ---
    {
      files: tsFiles,
      ignores: [...testIgnores, "**/ui/**", "components/ui/**", "app/**"],
      rules: {
        "no-restricted-syntax": ["error", ...backendGlobSyntaxSelectors],
        "no-empty": ["error", { allowEmptyCatch: false }],
      },
    },

    // --- backend-standards 2, 10, 11, 14, 16: service.ts ---
    {
      files: glob("**/*.service.ts"),
      ignores: testIgnores,
      rules: {
        "no-restricted-syntax": ["error", ...layerSyntaxSelectors],
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
              dbClientPath,
              trpcReactQueryPath,
            ],
          },
        ],
      },
    },

    // --- backend-standards 2, 11, 14, 16: repo.ts ---
    {
      files: glob("**/*.repo.ts"),
      ignores: testIgnores,
      rules: {
        "no-restricted-syntax": ["error", ...layerSyntaxSelectors],
        "no-await-in-loop": "error",
        "no-restricted-imports": [
          "error",
          { paths: [dbClientPath, trpcReactQueryPath] },
        ],
      },
    },

    // --- backend-standards 3: router.ts is an entry point ---
    {
      files: glob("**/*.router.ts"),
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

    // --- frontend-standards 3, 9, 14, 16, 31/64: every .tsx file ---
    {
      files: tsxFiles,
      plugins: { jig: jigPlugin },
      rules: {
        "jig/responsive-md-step": "error",
        "no-restricted-syntax": ["error", ...tsxSyntaxSelectors],
        "no-restricted-imports": [
          "error",
          {
            patterns: [
              {
                group: ["@base-ui-components/*", "@headlessui/*", "@mui/*"],
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
    {
      files: tsxFiles,
      ignores: testIgnores,
      rules: {
        "no-restricted-syntax": [
          "error",
          ...tsxSyntaxSelectors,
          ...forcedAssertionSelectors,
        ],
      },
    },

    // --- backend-tests 1, 3, 5, 6, 9, 14: *.test.ts ---
    {
      files: glob("**/*.test.ts"),
      rules: {
        "no-restricted-syntax": [
          "error",
          ...backendTestSelectors,
          {
            selector: 'CallExpression[callee.property.name="toBeDefined"]',
            message:
              "backend-tests 3: no setup, invocation, or specific assertion; toBeDefined.",
          },
          {
            selector: "CallExpression[callee.property.name=/^toBeLessThan/]",
            message:
              "backend-tests 14: budget test on a fake; toBeLessThan; count read off the implementation.",
          },
        ],
      },
    },

    // --- backend-tests 1, 5, 6, 9: *.test.tsx ---
    {
      files: glob("**/*.test.tsx"),
      rules: {
        "no-restricted-syntax": [
          "error",
          ...tsxSyntaxSelectors,
          ...backendTestSelectors,
        ],
      },
    },

    // --- e2e-tests, the two layers: no test draws a component ---
    {
      files: [...glob("**/ui/**/*.test.ts"), ...glob("**/ui/**/*.test.tsx")],
      rules: {
        "no-restricted-syntax": [
          "error",
          {
            selector: "Program",
            message:
              "e2e-tests: no component-test layer. An end-to-end flow in the e2e package proves a screen.",
          },
        ],
      },
    },

    // --- backend-tests 10: a test file is named after its source ---
    {
      files: [
        ...glob("**/__tests__/*.test.ts"),
        ...glob("**/__tests__/*.test.tsx"),
      ],
      plugins: { jig: jigPlugin },
      rules: { "jig/test-named-after-source": "error" },
    },

    // --- frontend-standards 50, 54: a fetching segment has loading and error files ---
    ...(options.pages
      ? [
          {
            files: options.pages,
            plugins: { jig: jigPlugin },
            rules: { "jig/segment-has-loading-and-error": "error" },
          },
        ]
      : []),
  ];
}
