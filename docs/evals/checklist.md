# Skill evals — what must be evaluated

One row is one eval case under `plugins/jig/evals/<id>-<slug>/`. `claude plugin eval` runs each case with the plugin and with no plugin, and reports the score difference.

Run the suite from `plugins/jig`:

```bash
claude plugin eval . --model sonnet --judge-model sonnet --runs 1 --trust-plugin --no-publish --max-cost-usd 20 -j 8
```

A skill works when its case passes with the plugin. A skill earns its tokens when the same case scores lower with no plugin. A case that scores the same in both arms shows text that the model did not need.

Ground: Anthropic, Skill authoring best practices — "Evaluations are your source of truth for measuring Skill effectiveness"; "Establish baseline: Measure Claude's performance without the Skill"; "Does this paragraph justify its token cost?"

## A. Delivery — the rules reach the agent

The case spawns the lane agent as a subagent and tells it to quote from its context with no tool. A `regex` grader looks for the exact skill text. The harness does not keep the subagent's trace, so it does not prove that the subagent used no tool.

| Id | Agent | Proof asked |
| --- | --- | --- |
| A1 | `frontend-feature-builder` | Quotes Verify item 1 of `recipe-search-and-filters` and lists all 11 `recipe-*` skills |
| A2 | `frontend-feature-reviewer` | Quotes Verify item 1 of `recipe-form-with-mutation` and the `does not apply` verdict rule |
| A3 | `step-builder` | Quotes the layer rule of `backend-standards` and Verify item 1 of `recipe-data-table` |
| A4 | `backend-feature-builder` | Quotes the module-scope `execute` rule, the `destructiveHint` default, the step retry count |
| A5 | `backend-feature-reviewer` | Quotes item 4 of the `backend-tests` Review checklist, the statement-counter heading, the step retry count |

## B. Obedience — the agent builds to the rule where a bare model does not

Each case gives the code in the prompt and one task. The prompt tells the agent to invoke the skill first, because the lane agents hold the skill before they start. `Write` and `Edit` are off, so the agent returns the code in its reply. Each rule clause has its own `llm` grader (`graders/r<n>-<clause>.md`), so a failure names the clause. `regex` graders check the key calls; a `tool_used: Skill` grader shows if the skill loaded. Run with `--judge-model sonnet`: the default small judge gave wrong FAIL votes on correct answers.

| Id | Skill under test | Task | Pass when |
| --- | --- | --- | --- |
| B1 | `recipe-search-and-filters` | Add a search box to a jobs list that reads `jobs.list` | The procedure takes `q` and narrows in SQL; no `.filter()` on fetched rows; `q` is in the URL through one nuqs parsers module; the input commits after a debounce |
| B2 | `recipe-search-and-filters` | The list falls to the skeleton on each search; fix it | The query input goes through `useDeferredValue`; `startTransition` is not passed to `useQueryStates` |
| B3 | `recipe-page-with-data` | Build a details page that reads one query | Server `prefetch` + `HydrateClient` + `Suspense`; the client reads with `useSuspenseQuery`; no `isLoading` branch |
| B4 | `recipe-form-with-mutation` | Build a create form | Zod schema shared with the procedure; field errors from the server map to fields; submit disabled while pending |
| B5 | `recipe-mutation-feedback` | Add an archive action with undo | Order of an optimistic write: cancel, snapshot, set, rollback, invalidate in `onSettled` |
| B6 | `recipe-tabs` | Add Active and Archived tabs to a list | The tab is in the URL; each panel has its Suspense boundary; hover and focus prefetch; no `startTransition` option on nuqs |
| B7 | `recipe-data-table` | Turn a list into a sortable, paged table | Sort and page are procedure input and URL state; TanStack Table v9 calls; the kit's pagination |
| B8 | `backend-standards` | Add a procedure that closes a job and emails the owner | Router calls exactly one service method; no SQL or transaction in the router; the repo owns the query |
| B9 | `backend-standards` (eve entry) | Add an eve tool `get_job` | `execute` is a named function at module scope; no factory; expected failures are return values |
| B10 | `backend-standards` (MCP entry) | Add an MCP tool `delete_job` | Annotations set on the tool; domain failure returns `isError: true`; no thrown domain error |
| B11 | `backend-standards` (workflow entry) | Add a workflow that screens an application | No I/O in the `"use workflow"` function; each step checks for done work first; errors classified |
| B12 | `backend-tests` | Review a test that pastes the implementation's output as its expected value | The agent rejects the test and names the Review item |
| B13 | `frontend-tests` | Review a test that mocks `useQuery` | The agent rejects the test; the fix mocks at the network or seeds the cache |
| B14 | `structure` | "Where does a new invites service, its repo and its test go?" | Every path matches the tree |
| B15 | `state-machines` | Render the actions a user can take from a machine snapshot | Renders from `hasTag` / `matches` through `useSelector`; no stage table beside the machine |
| B16 | `eve-agent` | Add a second tool to an agent | The agent opens the installed docs page first and runs `pnpm exec eve info`; never `npx eve` |
| B17 | `implementation-planner` | Plan a spec whose prototype filters a list in the browser | The search narrowing is a `## Backend` task; no F item describes a browser filter; `## Scope` names no single recipe |
| B18 | `skill-audit` | Audit a skill that keeps a Never rule in `references/` | The audit fails item 6 and moves the rule into `SKILL.md` |
| B19 | `open-feature-pr` | Write the PR title and body for a finished checklist | Branch, title and body match the convention; no invented sections |
| B20 | `recipe-edit-surfaces` | Add Rename and Delete actions to a row menu | Dialog, not a sheet; dialog controlled and outside the menu; closes after success; dirty guard; the verb on the confirm; prefetch on the trigger |
| B21 | `recipe-expanded-panel` | Add a maximize mode to an editor panel | One mounted tree; no portal or fixed layer; one boolean; `aria-expanded` and Escape; below-`lg` stated |
| B22 | `recipe-page-preview` | Live preview of a page that another app renders | One shared render component; no cross-app iframe; zero network on typing; foreign HTML sandboxed; theme scope |
| B23 | `recipe-rich-text` | Stream AI markdown into the Lexical editor | Read-only view during the stream; convert once; store JSON; no export in the change listener; one editor |
| B24 | `recipe-chat` | Build a chat surface with `useChat` and a data part | Registry components; card map; no effect on `messages`; status wired; inline error; no scroll effect |
| B25 | `frontend-wiring` | Wire tRPC and TanStack Query into a fresh app | Options proxy; one QueryClient factory that dehydrates pending queries; `cache` on the server; `prefetch` with no await; `server-only` |
| B26 | `frontend-authoring-custom` | Build a custom `Rating` component | Compound parts; exported prop types and `cn`; `value` / `onValueChange` / `defaultValue`; `data-state` and `data-slot`; keyboard map |
| B27 | `frontend-standards` | Review a component with six faults | Names each fault: tokens, template-literal class, derived state, per-row query, label, icon button name |
| B28 | `recipe-search-and-filters` | Add a search box over a list that the server caps at 5; the prompt says "keep the change small" | The server searches every row; no browser filter; `q` in the URL; debounce |
| B29 | `backend-standards` | Add `publishDraft` and `draftChanges` to a feature whose one service already holds create, read and update | Each new concern is its own file, named for it; nothing is appended to `drafts.service.ts`; each new file opens with its one-sentence concern |

## C. Triggering — the description fires on the task and only on the task

Each case repeats a B task with no instruction to load a skill. The only grader is `tool_used: Skill`.

| Id | Prompt | Pass when |
| --- | --- | --- |
| C1 | The B1 task: add a search box | `recipe-search-and-filters` or `frontend-standards` fires |
| C2 | The B2 task: the skeleton-on-search bug | `recipe-search-and-filters` or `frontend-standards` fires |
| C3 | The B8 task: add the `jobs.close` procedure | `backend-standards` fires |
| C4 | The B15 task: the machine's React client | `state-machines` fires |
| C5 | The B14 task: where the files go | `structure` fires |
| C6 | The B12 task: review a backend test | `backend-tests` fires |
| C7 | The B4 task: build the create form | `recipe-form-with-mutation` or `frontend-standards` fires |
| C8 | "How do I rename my git branch?" | No skill fires |
| C9 | "Explain this regex" | No skill fires |

## D. Waste — text that changes nothing

| Id | Check | How |
| --- | --- | --- |
| D1 | Skills with a delta of 0 in section B | Read the with/without scores of each B case; list each skill whose case a bare model already passes |
| D2 | Preload cost against use | Tokens that each lane agent preloads, against the recipes that its B cases used |
| D3 | Per-section ablation of a skill with a positive delta | Second pass: run the case with one section removed; a section with no score drop is a cut candidate |

## Not covered by these evals

- The code samples inside the recipes are not run here. That is the fixture work: a sample is proved by a test that runs it.
- Verify items that need a real Next.js runtime.
