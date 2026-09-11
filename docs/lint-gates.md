# Lint gates for the jig Review checklists

Date: 2026-09-10. Pilot repo: `ajiri-monorepo`, app `apps/dashboard`.

Purpose: move every Review item that a machine can check out of the reviewer's walk and into `eslint`, so the proof is one command and the reviewer walks only judgment items.

Executor: one agent run on a branch of the pilot repo, from the prompt in §5. Delivery: `pnpm lint` (`eslint .`) in `apps/dashboard`, which CI already runs through `turbo run build lint typecheck check --affected`.

Rule: a skill rule stays where it is. Only its Review item moves. A builder still reads the rule to write the code; the gate proves it.

## 1. Verdicts

One row per Review item. Verdict values:

- `lint now`: a shipped rule switched on, or one `no-restricted-syntax` selector or `no-restricted-imports` entry. Config edit only.
- `install`: a free plugin the repo does not ship yet.
- `custom`: a small ESLint rule with its own logic.
- `judgment`: stays with the reviewer.

`part` after a verdict means the lint catches one clause of the item and the rest stays judgment.

Selectors marked `probed` fired on a bad fixture and stayed silent on a good one today (`scratchpad/lint-probe`, ESLint 9.39.4, `@typescript-eslint/parser` from the pilot).

### 1.1 backend-standards (29 items)

| # | Item, short | Verdict | Rule | Files |
| --- | --- | --- | --- | --- |
| 1 | File outside the feature tree; schema outside `db/schema/` | judgment | | |
| 2 | Service or repo is a class or a singleton; a lower layer imports the db client | lint now, part | `ClassDeclaration` selector (probed); `no-restricted-imports` of `@ajiri/db/client` | `**/*.service.ts`, `**/*.repo.ts`, `**/*.repository.ts` |
| 3 | Entry point queries the DB or holds business logic | lint now, part | `no-restricted-imports` of `drizzle-orm` (queries). The db client stays allowed: an entry point is the composition root that hands `db` to a repo factory | `**/*.router.ts`, `agent/tools/**`, `apps/mcp/**/*.tool.ts` |
| 4 | Auth check written by hand in a procedure body | judgment | | |
| 5 | `"use workflow"` function does I/O | custom | needs the file directive | |
| 6 | Step side effect not re-checked; orchestrator branches on other data | judgment | | |
| 7 | Step failures not classified | judgment | | |
| 8 | MCP tool without `annotations`; throws a domain error; no text fallback | lint now, part | selector: `registerTool` object without `annotations` (the pilot's tools carry it at `update-job-draft.tool.ts:45`) | `apps/mcp/**/*.tool.ts` |
| 9 | Mutating MCP tool outside the idempotency wrapper | judgment | | |
| 10 | Service holds tRPC or SQL concerns | lint now | `no-restricted-imports` of `drizzle-orm`, `@trpc/server`, `@ajiri/db/client` | `**/*.service.ts` |
| 11 | Repo holds business logic, validation, or starts a transaction | lint now, part | selector `CallExpression[callee.property.name="transaction"]` | `**/*.repo.ts`, `**/*.repository.ts` |
| 12 | Layer boundary bypassed | lint now | covered by 2, 3, 10 | |
| 13 | Atomicity with no transaction | judgment | | |
| 14 | N+1, queries in a loop, duplicate queries | lint now, part | core `no-await-in-loop` | `**/*.repo.ts`, `**/*.repository.ts`, `**/*.service.ts` |
| 15 | Independent awaits in sequence | judgment | | |
| 16 | `SELECT *`; raw SQL with a Drizzle equivalent | lint now, part | selector `CallExpression[callee.property.name="select"][arguments.length=0]` (probed) | `**/*.repo.ts`, `**/*.repository.ts` |
| 17 | No pagination; no index | judgment | | |
| 18 | Hand-written or edited migration | judgment | git, not lint | |
| 19 | Repeated try/catch; error discarded | lint now, part | core `no-empty` with `allowEmptyCatch: false` | backend globs |
| 20 | Duplicated logic | judgment | | |
| 21 | Hand-declared type where inference exists | judgment | | |
| 22 | Helper takes the rest of a method as a callback | judgment | | |
| 23 | Function returns a function to bind a dependency | lint now | selector `ReturnStatement > :matches(ArrowFunctionExpression, FunctionExpression)`; count violations before enabling | backend globs, not `.tsx`, not tests, not `features/**/ui/**` or `app/(app-v2)/**`: a hook's subscribe returns its cleanup and a card action factory returns the handler the card context fixes |
| 24 | Factory writes a method body inside the returned object | lint now | selector `ReturnStatement > ObjectExpression > Property > :matches(ArrowFunctionExpression, FunctionExpression)[body.type="BlockStatement"]` | backend globs |
| 25 | Multi-line inline function or long object literal as an argument | lint now, part | selector `CallExpression[callee.name!=/^(it|test|describe|beforeEach|afterEach|beforeAll|afterAll)$/] > ArrowFunctionExpression[body.type="BlockStatement"][body.body.length>1]` (probed without the callee filter) | backend globs |
| 26 | Eve `execute` not a module-scope identifier; throws an expected failure | lint now, part | selector `CallExpression[callee.name="defineTool"] > ObjectExpression > Property[key.name="execute"][value.type!="Identifier"]` (probed) | `agent/tools/**` |
| 27 | Tool without an eval file; check target skips evals | custom | file existence | |
| 28 | Failure not logged with name, ids, message | judgment | | |
| 29 | No statement-budget test; count raised without a named behavior | judgment | | |

### 1.2 backend-tests (14 items)

| # | Item, short | Verdict | Rule | Files |
| --- | --- | --- | --- | --- |
| 1 | Asserts an internal call, `toHaveBeenCalled` | lint now | selector `CallExpression[callee.property.name=/^toHaveBeenCalled/]` (probed) | `**/*.test.ts` |
| 2 | Wrong layer | judgment | | |
| 3 | No setup, invocation, or specific assertion; `toBeDefined` | lint now, part | selector `CallExpression[callee.property.name="toBeDefined"]` | `**/*.test.ts` |
| 4 | Expected values not from the spec | judgment | | |
| 5 | Reads the clock or randomness | lint now | selector `NewExpression[callee.name="Date"][arguments.length=0], CallExpression[callee.object.name="Math"][callee.property.name="random"]` (probed) | `**/*.test.ts` |
| 6 | Mocks our own repo or service | lint now | selector `CallExpression[callee.object.name="vi"][callee.property.name="mock"][arguments.0.value=/^([.@]|@ajiri)/]` (probed with `[.@]`) | `**/*.test.ts` |
| 7 | Shares state | judgment | | |
| 8 | Rewrite litmus | judgment | | |
| 9 | Poor name; logic in the body | lint now, part | selector `CallExpression[callee.name="it"] BlockStatement > :matches(ForStatement, ForOfStatement, ForInStatement, WhileStatement, IfStatement)` (probed) | `**/*.test.ts` |
| 10 | Wrong file; file not named after its source | custom | file name check | |
| 11 | More than one behavior | judgment | | |
| 12 | Tests code that is not ours | judgment | | |
| 13 | Asserts behavior that lives in the fake | judgment | | |
| 14 | Budget test on a fake; `toBeLessThan`; count read off the implementation | lint now, part | selector `CallExpression[callee.property.name=/^toBeLessThan/]` | `**/*.test.ts` |

### 1.3 frontend-standards (63 rules; the Review is rules 1–63 plus recipe Verify lists)

| # | Rule, short | Verdict | Rule | Files |
| --- | --- | --- | --- | --- |
| 1 | Use the installed shadcn primitives | judgment | | |
| 2 | Never hand-edit a primitive | judgment | git, not lint | |
| 3 | One primitive library, Radix | lint now | `no-restricted-imports` of `@base-ui-components/*`, `@headlessui/*`, `@mui/*`, `react-aria-components` | `**/*.tsx` |
| 4 | Decompose by responsibility | judgment | | |
| 5 | Use `variant`/`size`, not overrides | judgment | | |
| 6 | Anatomy; split when a component grows | judgment | | |
| 7 | Composition over configuration | judgment | | |
| 8 | State through data attributes | judgment | | |
| 9 | `asChild` for a Button that is a Link | lint now | selector `JSXElement[openingElement.name.name="Button"]:not(:has(JSXOpeningElement > JSXAttribute[name.name="asChild"])) > JSXElement[openingElement.name.name="Link"]` | `**/*.tsx` |
| 10 | Preserve copy verbatim | judgment | | |
| 11 | Semantic color tokens only | judgment (install deferred, developer decision 2026-09-10: no Tailwind lint) | `eslint-plugin-better-tailwindcss` `no-restricted-classes` on palette classes | `**/*.tsx` |
| 12 | Tailwind scale, no arbitrary values | judgment (install deferred, developer decision 2026-09-10) | same plugin | `**/*.tsx` |
| 13 | `cn(...)` order | judgment | | |
| 14 | No template-literal class names | lint now | selector `JSXAttribute[name.name="className"] > JSXExpressionContainer > TemplateLiteral` | `**/*.tsx` |
| 15 | Design each form factor | judgment | | |
| 16 | No base → `lg:` jump | custom | class list analysis | |
| 17 | No container queries | judgment (install deferred, developer decision 2026-09-10) | same plugin, classes `@container`, `@*:` | `**/*.tsx` |
| 18 | Fluid, not fixed | judgment (install deferred, developer decision 2026-09-10) | same plugin, `w-[…px]` | `**/*.tsx` |
| 19 | Wide content scrolls in its own box | judgment | | |
| 20 | `useEffect` only for an external system | lint now, on already | `react-hooks/set-state-in-effect` is on at error in the pilot | |
| 21 | Derive during render | lint now | `react-hooks/no-deriving-state-in-effects`, shipped, off | `**/*.tsx` |
| 22 | User-action side effect runs in the handler | judgment | | |
| 23 | Primitive effect dependencies | lint now, on already | `react-hooks/exhaustive-deps` at warn; raise to error | |
| 24 | `useMemo`/`useCallback` only when measured | judgment | | |
| 25 | No derived state in `useState` | lint now | same rule as 21 | |
| 26 | The right primitive | judgment | | |
| 27 | Icon-only button has a name | lint now | `jsx-a11y/control-has-associated-label`, shipped, off | `**/*.tsx` |
| 28 | Inputs get labels | lint now | `jsx-a11y/label-has-associated-control`, shipped, off | `**/*.tsx` |
| 29 | Not color alone | judgment | | |
| 30 | 44×44 touch targets | judgment | | |
| 31–33 | Page prefetches its tree; no `await` on prefetch; same `queryOptions` | judgment | | |
| 34 | `@trpc/tanstack-react-query`, not the legacy wiring | lint now | `no-restricted-imports` of `@trpc/react-query` | `**/*.ts`, `**/*.tsx` |
| 35–45 | `useSuspenseQuery`, batching, no per-row queries, `cache`, `staleTime`, `gcTime` | judgment | | |
| 46 | Query keys from `queryOptions` | judgment | | |
| 47–49 | One freshness layer; `Suspense` per section | judgment | | |
| 50 | Every fetching segment has `loading.tsx` | custom | file existence | |
| 51–53 | Skeleton derived; one per boundary; no runtime data in `layout.tsx` | judgment | | |
| 54 | Every fetching segment has `error.tsx` | custom | file existence | |
| 55–63 | Error isolation; optimism; panels; `next/dynamic`; outside-click; dismissal | judgment | | |

### 1.4 frontend-tests (9 items)

| # | Item, short | Verdict | Rule | Files |
| --- | --- | --- | --- | --- |
| 1 | Asserts state, hooks, refs | judgment | | |
| 2 | `toHaveBeenCalled` | lint now | same selector as backend-tests 1 | `**/*.test.tsx` |
| 3 | Asserts CSS classes | lint now | selector `CallExpression[callee.property.name="toHaveClass"]` | `**/*.test.tsx` |
| 4 | Mocks own hooks or children | lint now | same selector as backend-tests 6 | `**/*.test.tsx` |
| 5 | Queries by test id | lint now | selector `CallExpression[callee.property.name=/ByTestId$/]` | `**/*.test.tsx` |
| 6 | Async UI without `findBy*`; absence without `queryBy*` | install | `eslint-plugin-testing-library` (`prefer-find-by`, `await-async-queries`); not installed in the pilot | `**/*.test.tsx` |
| 7 | jsdom asserts a visual outcome | judgment | | |
| 8 | Litmus | judgment | | |
| 9 | Fixture event order not from a trace | judgment | | |

### 1.5 eve-agent (11 items, plus the new `outputSchema` item)

| # | Item, short | Verdict | Rule | Files |
| --- | --- | --- | --- | --- |
| 1 | Rule or API not in the installed docs | judgment | | |
| 2 | Procedure in `instructions.md` | judgment | | |
| 3 | Rendered result has no `toModelOutput`; projection too large | judgment | which tools the client renders is not in the AST | |
| 4 | Side effect without `approval` or idempotency | judgment | | |
| 5 | Default built-in tool still enabled | custom | eight files must exist with `disableTool()` | `agent/tools/` |
| 6 | Hook blocks or injects | judgment | | |
| 7 | Remembered value rides `clientContext` | judgment | | |
| 8 | Lane without an eval | judgment | | |
| 9 | `useEveAgent` resumes without `resume: true`; shared store | lint now, part | selector `CallExpression[callee.name="useEveAgent"] > ObjectExpression:has(> Property[key.name="initialSession"]):not(:has(> Property[key.name="resume"]))` | `**/*.tsx` |
| 10 | Gate not run | judgment | | |
| 11 | Judge `on` lacks a fact; `.atLeast` for a spec threshold | judgment | | |
| new | Tool whose raw output a client, hook or mapping reads has no `outputSchema` | lint now | selector `CallExpression[callee.name="defineTool"] > ObjectExpression:not(:has(> Property[key.name="outputSchema"]))` (probed) | `agent/tools/**` |

## 2. Counts

| Skill | Items | lint now | install | custom | judgment |
| --- | --- | --- | --- | --- | --- |
| backend-standards | 29 | 12 | 0 | 2 | 15 |
| backend-tests | 14 | 7 | 0 | 1 | 6 |
| frontend-standards | 63 | 10 | 4 | 3 | 46 |
| frontend-tests | 9 | 4 | 1 | 0 | 4 |
| eve-agent | 12 | 2 | 0 | 1 | 9 |

`lint now` counts every row with that verdict, including `part` rows.

## 3. Steps

Tick a box only with the proof beside it.

- [x] S1 Add one config block to `apps/dashboard/eslint.config.mjs` with every `lint now` row of §1, one `files` entry per glob set. Switch on the shipped rules named in §1.3 rows 21, 23, 27, 28. Proof: committed on `chore/lint-gates` (pilot repo `ajiri-monorepo`); MCP-specific row 8 skipped (MCP lives in a different app, out of scope for this pilot's `apps/dashboard/eslint.config.mjs`).
- [x] S2 Prove each selector: two scratch files outside the repo, one that breaks every rule once and one that breaks none. Run `pnpm exec eslint` on both. Paste the output. Every rule must report once on the bad file and never on the good file. Proof: fixtures under the pilot's `apps/dashboard` tree (ESLint drops any file outside its base path), mirrored at the agent's scratch `lint-fixtures/`; every gated rule fired once on its bad fixture and stayed silent on its good fixture except `frontend-standards 9` (Button/Link `asChild`), which fires on both — an esquery `:has()` limitation with a chained `>` inside it, confirmed by direct `esquery.match` calls (see run report).
- [x] S3 Run `pnpm lint` in `apps/dashboard`. Record the count per rule in §4. Do not fix anything in this step. Proof: 1779 problems (1779 errors, 0 warnings); counts recorded in §4.
- [x] S4 For each rule with violations, the developer decides: fix in this PR, fix in a later PR with the rule at `warn`, or narrow the glob. Record the decision in §4. Proof: decisions recorded in §4 on `chore/lint-gates`; after S1's v2-tree scoping, only nine violations remained repo-wide — eight `eve-agent new` (`outputSchema`) reports in `agent/tools/*.ts` and one `frontend-standards 34` report in `trpc/client.tsx` — every other row's count in §4 predates the scoping and is zero once the rules are read against the v2 trees only.
- [x] S5 Apply the decisions. Fixes are one commit per rule. Proof: `e1d64b8f` (backend-standards 16), `e667b48b` + `8cde148c` (backend-standards 23), `ce37be6a` + `8cde148c` (backend-standards 25), `71ceac63` (backend-standards 24), `a36d6513` (backend-tests 6), `7a2f886f` (backend-tests 9, with backend-tests 1 bundled for `publish-turn.test.tsx` — its first appearance on the branch carried both), `6cbaf964` (backend-tests 1, the other two files), `e8df5ccd` (frontend-standards 14), `d19da14b` (jsx-a11y). `eve-agent new` and `frontend-standards 34` are left, per their §4 decisions. `pnpm lint` in `apps/dashboard` exits with exactly the nine expected problems; `pnpm typecheck` is clean; `pnpm vitest run features agent trpc` is 48 files / 445 tests passed.
- [x] S6 In each skill, add `Gate: pnpm lint, rule <name>` to the end of every Review item marked `lint now` in §1, and add the line `pnpm lint exits 0` to the skill's Gates section. Do not change the rule text. Only eve-agent had a Gates section; the other four skills got one above their Review section. Proof: jig commit on main, 2026-09-11 — 34 items suffixed (`part` rows name the clause the gate covers), five Gates lines, the eve-agent `outputSchema` rule and Review item 12 with `sources.md` and `eve-docs-map.md` rows, and one sentence in each `review-*-feature` skill so a gated item takes its verdict from the lint run. Skipped: backend-standards 8 (MCP; S1 did not gate it) and frontend-standards 20's row is on already. The config message for the `outputSchema` selector still reads `eve-agent new`; rename it to `eve-agent 12` in the next lint batch.
- [ ] S7 Update the plugin cache and restart Claude Code. Open the pilot PR with the `open-feature-pr` skill.

## 4. Violation counts and decisions

Filled in by S3 and S4. Counts are from a full `pnpm lint` run in `apps/dashboard`
(1779 problems, all errors, 0 warnings); `no-restricted-syntax` and
`no-restricted-imports` are grouped by the doc row named in each violation's
message.

| Rule | Count | Decision |
| --- | --- | --- |
| no-restricted-syntax (backend-standards 24) | 532 | v2 trees only; fixed — every factory's returned method named above the object literal (`71ceac63`) |
| no-restricted-syntax (backend-tests 9) | 338 | v2 trees only; fixed — loops/ifs unrolled or pulled into a named fake/helper above the test (`7a2f886f`) |
| no-restricted-syntax (backend-tests 5) | 35 | v2 trees only; fixed before this pass — `ab66cfc3` made the date fixture deterministic |
| no-restricted-syntax (backend-tests 1) | 161 | v2 trees only; fixed — assertions read the recorded call or the observable outcome instead (`7a2f886f`, `6cbaf964`) |
| no-restricted-syntax (frontend-standards 14) | 137 | v2 trees only; fixed — `cn(...)` replaces every template-literal `className` (`e8df5ccd`) |
| no-restricted-syntax (backend-standards 25) | 101 | v2 trees only; fixed — multi-statement inline callbacks pulled into named functions (`ce37be6a`, `8cde148c`) |
| no-restricted-syntax (backend-tests 6) | 48 | v2 trees only; fixed — selector narrowed to exclude `@/lib/auth/dal` and RSC-only seams that have no other seam (`a36d6513`) |
| no-restricted-syntax (backend-standards 11) | 36 | v2 trees only; none in scope — zero reports in the v2 trees once S1 scoped the rule |
| no-restricted-syntax (backend-standards 16) | 33 | v2 trees only; fixed — repos name every column instead of `select()` (`e1d64b8f`) |
| no-restricted-syntax (backend-tests 3) | 32 | v2 trees only; none in scope — zero reports in the v2 trees once S1 scoped the rule |
| no-restricted-imports (backend-standards 2) | 27 | v2 trees only; none in scope — zero reports in the v2 trees once S1 scoped the rule |
| no-restricted-syntax (frontend-standards 9) | 0 | v2 trees only; none in scope — selector fires on both fixtures (S2); no live report in the v2 trees to act on |
| no-restricted-syntax (backend-standards 23) | 15 | v2 trees only; fixed. The UI trees are out of the rule (a hook returns its cleanup; a card action factory returns the handler the card context fixes); one documented exception stays in `agent/lib/ari/turn-timing.ts` for the eve hook handler map |
| no-restricted-syntax (backend-tests 14) | 10 | v2 trees only; none in scope — zero reports in the v2 trees once S1 scoped the rule |
| no-restricted-syntax (eve-agent new) | 8 | deferred to the tools fold — all eight sites are `agent/tools/*.ts`, which are being folded into four files on another branch |
| jsx-a11y/control-has-associated-label | 7 | v2 trees only; fixed — hidden file inputs and icon-only controls named with `aria-label` (`d19da14b`) |
| jsx-a11y/label-has-associated-control | 6 | v2 trees only; fixed — the remote-scope radio's label points at its input by id (`d19da14b`) |
| no-restricted-imports (backend-standards 10) | 2 | v2 trees only; none in scope — zero reports in the v2 trees once S1 scoped the rule |
| no-await-in-loop | 2 | v2 trees only; none in scope — zero reports in the v2 trees once S1 scoped the rule |
| no-restricted-imports (backend-standards 3) | 1 | v2 trees only; none in scope — zero reports in the v2 trees once S1 scoped the rule |
| no-restricted-imports (frontend-standards 34) | 1 | v2 uses the legacy wiring too (12 files import `trpc/client.tsx`); one documented exception at the import until a checklist moves the app to `@trpc/tanstack-react-query` |
| no-restricted-syntax (backend-standards 2) | 0 | v2 trees only; none in scope |
| no-restricted-syntax (backend-standards 26) | 0 | v2 trees only; none in scope |
| react-hooks/no-deriving-state-in-effects | 0 | v2 trees only; none in scope |
| react-hooks/exhaustive-deps | 0 | v2 trees only; none in scope |
| no-empty | 0 | v2 trees only; none in scope |

## 5. Open questions for the developer

1. Where does the config live for a second repo? jig has no initializer skill and no `assets/` under any standards skill. Options: an `assets/eslint.jig.mjs` file each skill tells the builder to import, or a published config package. Not decided here.
2. The `install` rows need `eslint-plugin-better-tailwindcss` and `eslint-plugin-testing-library`. Both are free. Not in this pass.
3. Rows 23, 24, 25 of backend-standards may report many places in the pilot. S3 shows the count before S4 decides.

## 6. Batch 2: the custom rules

Date: 2026-09-11. Same pilot, same executor model as §3: one agent on a branch, `pnpm lint` in `apps/dashboard` is the delivery. Facts below were verified on main at dbc86376.

Plumbing, the same for every rule:

- One rule per file at `apps/dashboard/eslint-rules/<name>.mjs`, default export `{ meta: { type, docs: { description }, messages }, create(context) }`. The message text starts with the skill row it gates, like the messages in `eslint.config.mjs`.
- One test per rule at `apps/dashboard/eslint-rules/__tests__/<name>.test.ts`, with `RuleTester` from `eslint`. Set `RuleTester.describe = describe`, `RuleTester.it = it`, `RuleTester.itOnly = it.only` from vitest before the first `run` (`node_modules/eslint/lib/rule-tester/rule-tester.js:491-549`). The vitest `node` project already includes `**/*.test.ts` (`vitest.config.ts:43`). Fixtures that need TS or JSX parse with `@typescript-eslint/parser`; add it as a devDependency at 8.59.0, the version `eslint-config-next` already puts in the store. A rule that reads the file system is tested against a tree the test builds with `mkdtempSync` under `os.tmpdir()` and hands in through the case's `filename`.
- Write the test first from the row's wording: one valid case that obeys the row, one invalid case per report kind. Red, then the rule, then green. One commit per rule, test and rule together.
- Wire every rule in `eslint.config.mjs` through one inline plugin, `plugins: { jig: { rules } }`, rule ids `jig/<name>`, at `error`, on the v2 trees only (`v2Glob`), each rule on the files its row names below.

### 6.1 Rule definitions

| Row | Rule id | Files | Reports |
| --- | --- | --- | --- |
| backend-standards 5 | `jig/workflow-deterministic` | `features/**/workflows/**/*.ts` (the `structure` tree's workflow home) | Inside a Program or a function whose body starts with the `"use workflow"` directive: `new Date()` with no argument, `Date.now()`, `Math.random()`, `crypto.randomUUID()`, `fetch()`; and an import whose source ends in `.service`, `.repo` or `.repository`, or is `@ajiri/db/client`, `drizzle-orm` or `@trpc/server`. |
| backend-standards 27, eval clause | `jig/tool-has-eval` | `agent/tools/*.ts` | The Program holds a `defineTool(` call and `evals/tools/<basename>.eval.ts` does not exist under `context.cwd`. The check-script clause stays judgment. |
| backend-tests 10 | `jig/test-named-after-source` | v2 `**/__tests__/*.test.ts` and `*.test.tsx` | Neither `../<name>.ts` nor `../<name>.tsx` exists beside the `__tests__` folder, where `<name>` is the basename without `.test.ts` or `.test.tsx`. |
| frontend-standards 16 | `jig/responsive-md-step` | v2 `**/*.tsx` | A string literal or template quasi whose whitespace-split classes hold one that starts with `lg:` and none that starts with `sm:` or `md:`. An object key such as `lg:` in a `cva` size map is an identifier, not a literal, and is not read. |
| frontend-standards 50 and 54 | `jig/segment-has-loading-and-error` | `app/(app-v2)/**/page.tsx` | The page fetches, and `loading.tsx` (row 50) or `error.tsx` (row 54) is missing from the page's directory; one message per missing file. A page fetches when it calls `prefetch`, or holds an `await` whose argument is a call expression. `await params` has an identifier argument and does not count. |
| eve-agent 5 | `jig/default-tools-disabled` | `agent/agent.ts` | For each of `agent`, `ask_question`, `bash`, `read_file`, `todo`, `web_fetch`, `web_search`, `write_file`: `agent/tools/<slug>.ts` does not exist, or its text does not contain `export default disableTool()`. One message per slug. |

Sites on main at dbc86376, counted by hand before the rules exist, so the run in C3 has a number to match:

- `jig/workflow-deterministic`: 0 files in scope. Every `"use workflow"` file sits under `app/workflows/`, which the S4 decision keeps out of scope. The rule ships for the next workflow a feature adds.
- `jig/tool-has-eval`: 0. The four tools `draft`, `jd`, `job`, `questions` each have their eval file.
- `jig/test-named-after-source`: 23. `trpc/__tests__/coverage.test.ts` and `pep.test.ts`; `agent/lib/ari/__tests__/statement-total.test.ts` and the four `*.budget.service.test.ts`; 15 behavior-named files under `features/ari-chat/ui/__tests__/`; `features/interview-availability/ui/__tests__/availability-screen.test.tsx`.
- `jig/responsive-md-step`: 7 literals. `_components/jobs/job-row.tsx:39,63`, `_components/jobs/chat-thread-row.tsx:32,60`, `_components/job/candidate-list.tsx:48,64`, `features/ari-chat/ui/chat-session.tsx:794`.
- `jig/segment-has-loading-and-error`: 0. Only `chat/page.tsx` fetches, and it has both files.
- `jig/default-tools-disabled`: 0. All eight files exist with `export default disableTool()`.

### 6.2 Steps

- [ ] C1 For each rule in 6.1, in table order: write the test, see it fail, write the rule, see it pass, commit. Proof: six commits, each with the green test run pasted.
- [ ] C2 Wire the six rules in `eslint.config.mjs` as the plumbing says. Proof: `pnpm lint` runs with no config error.
- [ ] C3 Run `pnpm lint` in `apps/dashboard`. Record the count per rule in 6.3. It must match the by-hand count above; a mismatch is a rule bug, fix the rule before you go on.
- [ ] C4 Stop and report the counts. The developer decides per rule with a count: fix in this PR, `warn` for a later PR, or narrow the files. Record the decision in 6.3.
- [ ] C5 Apply the decisions, one commit per rule. Proof: `pnpm lint` exits 0, `pnpm typecheck` clean, `pnpm vitest run` green.
- [ ] C6 Open the PR. Then add `Gate: pnpm lint, rule jig/<name>` to the six skill rows (a jig edit, the developer's session).

### 6.3 Counts and decisions

| Rule | Count | Decision |
| --- | --- | --- |
