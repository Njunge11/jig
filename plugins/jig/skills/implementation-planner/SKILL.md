---
name: implementation-planner
description: Converts a spec doc into a tracker and implementation checklists. Each implementation checklist is one PR and holds the tasks that implement it. A checklist with a screen also lists the end-to-end tests that prove it and the design source file of each screen. The tracker lists every implementation checklist with its status and its /goal run command. Work that changes what the software does gets a TDD implementation checklist, which a builder implements with TDD. Work that only changes the code's structure gets a step implementation checklist, which the implement-steps skill executes step by step. The skill audits the repo first, and asks the developer when the spec leaves a decision open. Use when the developer runs /jig:implementation-planner with a doc path, or asks to plan a spec's implementation, to split a spec doc into checklists or PRs, or to write a spec's project tracker.
---

# Implementation planner

Author documents only. Do not write code or tests. Do not create branches. Do not run the implementation checklists.

## Instructions

### Step 1: Read the spec

The spec is the doc at `$ARGUMENTS`. Read the full document.

### Step 2: Audit the repo

First check the repo's baseline: `CLAUDE.md`, `.github/workflows/ci.yml`, `.husky/pre-commit`, `.husky/commit-msg`, `.husky/pre-push`, `.env.example` and the e2e package (`packages/e2e/playwright.config.ts`, or `e2e/playwright.config.ts` in a repo with one app) exist, and `CLAUDE.md` says whether work goes straight to main. When one is missing, stop and tell the developer to run `/jig:scaffold-repo` on the repo first: a checklist built on a repo with no CI check, no hooks, no e2e package or no git-flow rule fails at its Done items, not at build time. Write the Done items in the form that matches `CLAUDE.md`: the straight-to-main form when it says so, the PR form otherwise.

Then read the codebase and collect the context this spec's implementation checklists need: what already exists, what must be added, what must change to implement the spec. Every fact about the repo that you write into an implementation checklist must be verified against the repo in this session, not from memory.

### Step 3: Resolve gaps with the developer

Two kinds of gap stop the work:

1. The spec leaves undecided a detail the implementation checklists need.
2. The audit shows the spec is wrong about the repo.

A detail that a standards skill or a recipe decides is not a gap. Where a search, a filter or a sort runs, where its state lives, which layer owns a query: the skill decides, and the checklist follows it. Do not ask the developer to choose.

In both cases, ask the developer. Write the resolution into the spec doc. Then continue from the amended spec. Do not design the answer yourself.

Write each resolution into the spec as the rule it sets, in the spec's own words. The spec holds rules only: never a `Developer said:` line, a quote of the developer, or a note that the developer was asked. A `Developer said:` line an earlier run left in the spec loses its quote and keeps its rule. Keep the developer's answer to each gap, word for word, from this session, for the run's final report: one line per resolution, the rule it set and the answer that set it. A resolution with no answer from this session is one you designed: delete it from the spec and report the gap as open. The final report is the audit trail Step 5 checks.

### Step 4: Split the work into implementation checklists

Split the spec's work into implementation checklists. One implementation checklist is one PR, and one PR is one slice: the smallest change a person can verify on the running app. A slice carries everything that outcome needs — the backend, the frontend, and any migration, agent tool, machine, hook or seed on the path between them. A backend change nobody can see on a screen is not a slice: it belongs inside the slice that makes it visible. Order the checklists so that each one depends only on earlier ones.

A checklist holds at most 15 tasks, its `## Backend` and `## Frontend + Integration` sections together. The `E<n>` lines of `## E2E tests` are not tasks and do not count. A builder's context compacts about every 15 commits; each compaction reloads the skills and cuts the proofs a goal watcher reads (measured on four runs: slices of 13 and 14 commits built in 81 and 170 min with 2–3 compactions; a slice of 45 commits took 361 min with 7 compactions and 34 skill loads). A slice that needs more than 15 tasks splits into two checklists in order, at a point where the first is still verifiable on the running app. When no such point exists, keep it whole and write the task count in its tracker row.

A builder is the session that executes one implementation checklist, task by task: the developer starts it with the checklist's /goal command, and it runs the `implement-*` skills itself, with no builder subagent. Only the review runs in a subagent, read-only.

Before you write the first checklist, invoke the test skills with the Skill tool, one call each: `backend-tests` when a slice has backend work, and `e2e-tests` when a slice has a screen. **Gate:** the transcript shows each call before the first checklist file is written.

Write each implementation checklist as `docs/<project>/checklists/NN-<slug>.md`. One question decides which checklist to write: **does the work change what the software does?**

- Yes: write one TDD implementation checklist for the slice. Its `## Backend` section follows the **TDD implementation checklist — backend** section of this skill and its `## Frontend + Integration` section follows the **TDD implementation checklist — frontend** section of this skill; a slice that touches both domains holds both sections in the one file, backend first. Every TDD checklist with a `## Frontend + Integration` section has an `## E2E tests` section with at least one `E<n>` line: a step a person performs on the running app, which an end-to-end test performs for them. A checklist that cannot name one is not a slice — merge its work into the slice that makes it visible. A checklist with only a `## Backend` section has a `## Manual verification` section with at least one step in its place. Before you write the first section of a domain, invoke that domain's tests skill: `backend-tests` for `## Backend`, `e2e-tests` for `## Frontend + Integration` and `## E2E tests`. Its Review checklist defines the tests the builder writes — write every task and every `E<n>` line so its tests can pass that checklist. There is no component-test layer: no task and no line asks for a jsdom test. Before you write a `## Frontend + Integration` section, also invoke the `frontend-standards` skill, walk its recipe catalog row by row against the slice, and invoke each `recipe-*` skill whose row matches. Do this even when the request asks for one section only. The **How to fill it** list of the frontend format says what the tasks take from the recipes.
- No — the work only changes the code's structure: write a step implementation checklist, per the **Step implementation checklist** section of this skill. Its `Domain` line names the domain.
- Work that changes both behavior and structure: split it into a TDD checklist and a step checklist. If the answer is unclear, ask the developer.

When designs come with the spec, list each design of the slice in a `## Designs` section in the frontend checklist, as the **TDD implementation checklist — frontend** section of this skill specifies. A design is its source file (`docs/designs/<Screen>.dc.html`), which a browser draws: never a picture, and never a transcription of one. Open the source file of every design you list, in this session. A design the spec references that has no source file in the repo is a Step 3 gap — ask the developer for the source.

Also give each implementation checklist its Conventional Commits type (`feat`, `fix`, `chore`, `refactor`, ...). The type names its branch and PR title. It does not decide which checklist to write.

Then write the tracker as `docs/<project>/tracker.md` — fill the **Tracker template** at the end of this skill. The tracker carries each implementation checklist's /goal run command:

For a TDD implementation checklist with both a `## Backend` and a `## Frontend + Integration` section:

```
/goal the implement-backend skill was run on docs/<project>/checklists/NN-<slug>.md for its Backend section, then the implement-frontend skill was run on the same checklist for its Frontend + Integration section, and every item in its Done section is shown satisfied in the transcript. Every step under Manual verification is the developer's check and never holds the goal open. The review verdict is the last review run's verdict.
```

For a TDD implementation checklist with only a `## Backend` section:

```
/goal the implement-backend skill was run on docs/<project>/checklists/NN-<slug>.md and every item in its Done section is shown satisfied in the transcript. Every step under Manual verification is the developer's check and never holds the goal open. The review verdict is the last review run's verdict.
```

For a TDD implementation checklist with only a `## Frontend + Integration` section:

```
/goal the implement-frontend skill was run on docs/<project>/checklists/NN-<slug>.md and every item in its Done section is shown satisfied in the transcript. Every step under Manual verification is the developer's check and never holds the goal open. The review verdict is the last review run's verdict.
```

For a step implementation checklist:

```
/goal the implement-steps skill was run on docs/<project>/checklists/NN-<slug>.md and every step and every Done item in it is shown satisfied in the transcript; for each Done item the pasted proof is the command, its final summary output, and its exit status — full output is not required. The review verdict is the last review run's verdict.
```

### Step 5: Check your output

Check every file you wrote. Fix every miss, then check again.

1. Open every checklist link in the tracker table. The file must exist. A tracker entry that links to a missing file cannot be run.
2. List the files in `checklists/`. Every file must appear in the tracker table. An implementation checklist missing from the tracker is never built.
3. Read each /goal run command. The path in it must equal the real path of the implementation checklist it runs. With a wrong path, the checklist can never pass its /goal check.
4. Checklist numbers must agree across the tracker table, the filenames, and the run-command labels. No two implementation checklists share a number.
5. Each /goal command must match its template in Step 4: the TDD command that matches the sections the checklist holds, the step command for a step implementation checklist.
6. Every task checkbox in every implementation checklist must be `[ ]`. The builder ticks boxes, not you.
7. Every implementation checklist this run created must have Status `Not started` in the tracker. A checklist that was already in the tracker before this run keeps its Status.
8. Every section heading and label in every implementation checklist must come from its template. A label copied from an older document in the repo does not belong — the template decides the format, not the documents already there.
9. When designs came with the spec, each frontend TDD implementation checklist must have a `## Designs` section. Every `D<n>` line names a source file that exists in the repo, and names a route or an `E<n>` line that shows that state. No line names a picture, and no line transcribes a design.
10. Every resolution this run wrote into the spec has a line in the run's final report that quotes the developer's own answer from this session. A resolution without one is deleted from the spec, and its gap is reported as open in the run's final report. The spec holds no `Developer said:` line and no quote of the developer.
11. No `## Manual verification` item names a script the repo can run, except the eval scripts and a turn sent to a model with its `eve traces`, which stay there. Any other one moves to `## Done`, with the task that makes the script load its own keys when it needs them.
12. Every TDD implementation checklist with a `## Frontend + Integration` section has an `## E2E tests` section with at least one `E<n>` line, and one with only a `## Backend` section has a `## Manual verification` section with at least one step. One without it is not a slice: merge its work into the checklist that makes it visible, and renumber nothing that was already in the tracker.
13. Every frontend task agrees with each recipe whose catalog row matches the slice. No task has the browser search, filter, sort or page rows that it already fetched; that work is a `## Backend` task on the list procedure.
14. Every task that shows a machine's stage (a tab per stage, a stage label or badge, a stage filter) says that the stage's name and the set of stages come from the machine's reader module, and no task has a screen write its own list or map of them. Every copy that the repo audit found (a map, list or union of the machine's stage values or names, on any screen) has a task that replaces it with the reader module's export.
15. No task is only a test. A task that names a test file and no behavior of its own (`<file>.test.ts covers …`, "the tests for …") is folded into the task whose behavior it tests: its cases join that task's text, and the tests-only task is deleted. The builder writes a task's tests in that task's commit, so a tests-only task can never get its own commit, and the Done item "one commit per task" then fails after the branch is pushed, where only a history rewrite could meet it.
16. No task writes, runs or names an eval, and no `## Done` item waits on one. Delete such a task; the developer's own eval run stays under `## Manual verification`.
17. Every `## Done` item that proves a command is met by output the command prints on every run. No item demands a first-run line (`added`), a one-time secret, a URI shown once, or output from an earlier session: a builder runs the command again after a compaction or a retry, and the item must still pass. A seed item reads: `pnpm db:seed ran against the dev database in this transcript: its summary line pasted (the added line, or the already-on-file line), any secret redacted.` The builder runs `db:push` and `db:seed` itself; no item and no Manual verification step hands them to the developer.
18. No two `## Done` items prove the same thing. Merge them into one.
19. Every `## E2E tests` section covers its flow as the **The list first, the test code after the build** section of `e2e-tests` states: each step in order, each failure path the spec states, each edge case a person can cause, and each event a person can send in each state of a machine the screen shows. Each `E<n>` line states a step or a case and its outcome in the person's words. No line is a case that a browser cannot cause: that case is a `## Backend` task.
20. No task, no line and no Done item asks for a component test, a jsdom test, a mocked network or a `browser-check` verdict, and no `## Manual verification` step is a click-through of the app: an `E<n>` line covers it.

When every check passes, you are done.

## When a step fails

- **`$ARGUMENTS` is empty, or the spec doc does not exist.** Do not guess a path. Ask the developer for the spec doc's path.
- **The developer does not resolve a gap from Step 3.** Stop and report the open question. Never design the answer yourself. Never write a checklist over a gap.
- **`docs/<project>/tracker.md` already exists.** Add this run's rows and run commands to it. Keep every row that is already there, with its number and its Status. Never renumber an existing implementation checklist.
- **The developer changes a decision after its checklist exists.** The change goes through the spec, never into the checklist by hand: write it into the spec as the rule it sets, then re-run this skill on the spec. Rewrite the checklist that the changed text covers, in place — same file, same number, same tracker row — and run Step 5 on it. A checklist whose PR has not merged is rewritten in place, whatever its Status: a `Not started` one on `main`, one with a branch on that branch. Its ticked boxes stay as the builder left them, and each changed row is a new `[ ]` box. Only a checklist whose PR has merged keeps its text, and the change becomes a new checklist with the next number. A checklist edited outside this skill skipped Step 3 and Step 5: its new rows were never checked against the developer's answers and got no recipe walk, so a builder finds the gaps at build time and fills them itself.
- **A Step 5 check fails twice on the same file.** Stop and report the file, the failing check, and the fix you tried. A tracker with a wrong link or a wrong run command is worse than no tracker.

## Checklist formats

Step 4 writes every checklist to one of these three formats.

### TDD implementation checklist — backend

How to write a TDD implementation checklist for backend work that changes what the software does. The builder (implement-backend) implements it with TDD, one task at a time.

#### How to fill it

- Copy the spec's wording verbatim. Do not invent labels or microcopy.
- Write each task so its tests can pass the Review checklist of the `backend-tests` skill (invoked in Step 4): one observable behavior, expected values from the spec, testable in its layer's test setup.
- Each failure path the spec states is a behavior: give it its own task. The task list is the feature's coverage contract — a behavior with no task gets no test.
- A task is a behavior, never a test file. The builder writes a task's tests inside that task (its Red step), so a task that only names a test file (`<file>.test.ts covers …`) has no work of its own, gets no commit of its own, and fails the Done item "one commit per task". Write the cases a behavior's test needs into the task that builds the behavior. A fake's contract-test case goes in the task that adds the fake's method.
- A behavior an entry point exposes gets its tests in the entry-point test, on the real database (`backend-tests` Review item 16). A task on a service names a service test only for a branch no entry-point test reaches, and names that branch.
- Each entry-point call the checklist adds or changes (a procedure, an MCP tool, an eve tool, a workflow step) gets one statement-budget task, on the call's widest path; a second input shape of the same call gets no budget. List the statements the path needs, one per row set read or written, and write the count and the list into the task. The builder's test asserts that exact count on the real database (`backend-standards` § "Queries & performance"; `backend-tests` Review item 14). Derive the list from the spec and the repo audit, never from a run.
- No task asks for a test of the call trace (`backend-tests` Review item 15). The trace is a development aid; the statement-budget task covers the queries.
- Each `### <source file>` heading names one file, and one file holds one concern (`backend-standards` § Structure, "One file, one concern"): `<concern>.service.ts`, `<resource>.repo.ts`, `<resource>.router.ts`. A task that adds a second concern to a file goes under a second heading. Never plan one `<feature>.service.ts` that holds every service of the feature.
- A checklist that renames or removes a machine's state, or takes away a transition, carries one task: the old state keeps a transition forward for the rows that rest on it, and the machine test lists every stage value the store has ever held and proves each one moves forward (`state-machines` Part B; its Review item 16). List the stored values from the repo audit of the machines that shipped, never from memory.
- If the implementation checklist creates a new app or package, list its setup in Scope: package.json with the standard scripts, tsconfig, vitest setup, drizzle config, `db/schema/`.
- `## Done` holds only what the builder can prove with output it can paste: a test run, a command, or the diff. A spec-stated check that only a human can perform goes under `## Manual verification` — the developer runs it, not the builder. In a checklist with only a `## Backend` section, `## Manual verification` is never empty: at least one step a person performs on the running app, because the checklist is a slice. In a checklist that also has a `## Frontend + Integration` section, the `## E2E tests` lines take that place.
- A Done item that proves a database command (`db:push`, `db:seed`) is met by the output the command prints on every run, never by a first-run line or a one-time secret (Step 5, check 17). The builder runs the command itself against the dev database; the developer is never asked to.
- When the slice also has a `## Frontend + Integration` section, the two sections share one file: `## Backend` first, then `## Frontend + Integration`, then `## E2E tests`, then one `## Done` at the end that merges both templates' items. Each section's task line covers only its own boxes. The backend run proves the Backend items and commits them locally; the frontend run, in the same session, proves the rest, pushes the branch once and opens the one PR.
- A check the repo runs from a script is the builder's, even when it needs a key. When the script does not load its keys, the checklist's first task makes it (`dotenv -e .env -- …`), and the check is a Done item. Only a check with no script (a browser, a device, a person) is manual. The eval scripts (`eve eval`, mock or live) and a real turn (a message sent to the dev server, and the `eve traces` of it) are the exceptions: they call a model, so they are never a Done item and a builder never runs them. They go under `## Manual verification`, as the developer's own run from the chat interface. No task writes an eval either: the files under `evals/` are the developer's (`eve-agent` § Evals).

#### Template

Copy the template below. Replace each `<placeholder>` with this implementation checklist's content. Save it as `docs/<project>/checklists/NN-<slug>.md`.

```markdown
# NN — <checklist name>

## Scope

<What this builds.> Spec: `docs/<spec>.md`, section <section>.
Target: <app or package>, feature <slug>. Builds on: <earlier checklists, or none>.
Type: <Conventional Commits type>. Branch: `<type>/<slug>`.

Setup (only when this checklist creates a new app or package):
- <the setup items from the How to fill it rules>

## Backend

### <source file>

- [ ] <one task: an observable behavior with expected values from the spec>
- [ ] <the call> runs exactly <N> statements: <one line per statement, naming the row set it reads or writes>

## Manual verification

- <command the developer runs>

## Done

- [ ] Every task box in `## Backend` is checked and shown.
- [ ] The full suite is green: the push's test summary pasted, or, when the repo pushes straight to main, the pushed commit's CI run id and `success` pasted.
- [ ] `git log` shows one commit per task, or the handoff's Deviations names each commit that holds two tasks.
- [ ] `docs/<project>/handoffs/NN-<slug>.md` exists.
- [ ] <verification the spec states and the builder can prove, copied word for word>
- [ ] The handoff's `## Review` section holds the one `review-backend-feature` verdict, pasted whole: its count lines and its fail lines.
- [ ] The handoff's `## Review` section names the one commit, made after that review, that fixes its `fail` lines, or says `No fail line.` The review ran once; a second review is never run and never required.
- [ ] Tracker Status flipped to Done.
- [ ] PR open with its URL, opened as the `open-feature-pr` skill specifies, or the commit on main when the repo pushes straight to main.
```

### TDD implementation checklist — frontend

How to write an implementation checklist for frontend work that changes what the software does. The builder (implement-frontend) builds the screens one task at a time, makes each screen look like its design, and then writes and runs the end-to-end tests of the checklist.

#### How to fill it

- Copy the spec's wording verbatim. Do not invent labels, headings, or microcopy.
- The section has three lists. `F<n>` items under **Behavior** are the tasks: each one is a behavior the builder builds, with one commit. `V<n>` items under **Responsive** are the widths that have no design. `E<n>` lines under `## E2E tests` are the end-to-end tests that prove the slice.
- An `F<n>` task is one observable behavior in the words of the spec: what the person sees and does, and what the screen shows after. It is never a test file, and it has no test of its own: no jsdom test, no mocked network. The `E<n>` lines prove it.
- Each failure path and each empty state the spec states is a behavior: give it its own `F<n>` task, and its own `E<n>` line.
- When designs come with the spec, add a `## Designs` section: one `D<n>` line per design of the slice. A line names the design, the state of the app that shows it (a route, or the `E<n>` line whose step opens it), and the source file. A dialog, a sheet, an empty state and an error state each have their own design and their own line. Never transcribe a design into statements, and never write a value read off it: the source file holds each value, and the design check of `e2e-tests` compares the built screen with it.
- When you write a `## Designs` section, add this item to `## Done`: `- [ ] One verdict per D item pasted: the passed design check (the pnpm screens line, or the flow step with expectDesign), and pass or fixed with file:line for the five things the run does not compare.` It makes the builder's design check visible to the /goal watcher.
- A design has one width. Write one `V<n>` item per width that the screen must work at and that has no design: `V1 At 375 the table scrolls in its own container`. The builder saves a screenshot at that width and reads it.
- Write the `## E2E tests` section as the **The list first, the test code after the build** section of the `e2e-tests` skill (invoked in Step 4) states. One `E<n>` line per step of the flow in order, per failure path the spec states, per edge case a person can cause (an empty list, a second click, Back, a reload in the middle of the flow, a link opened a second time), and per event a person can send in each state of a machine the screen shows. Take the events from the machine file, never from memory. Each line states the step or the case and its outcome in the person's words, with the expected text from the spec. Do not drop a line to save work: an agent writes the tests.
- A case that a browser cannot cause (the server time, a provider that fails, two people on one row, a cron job) is never an `E<n>` line. It is a `## Backend` task.
- Name the flow file above the lines: `packages/e2e/flows/<app>/<flow>.spec.ts`. A slice that extends a flow of an earlier checklist names that file.
- The `E<n>` lines are not tasks: they do not count toward the limit of 15, and the builder commits the flow file once, after the build.
- Before you write the first `F<n>` task, invoke the `frontend-standards` skill and walk its catalog row by row against the slice. For every row that matches, invoke that row's `recipe-*` skill, and write the tasks to agree with it. A behavior that a recipe's Don't list forbids is never a task. Work that a recipe puts on the server — the rows a search, a filter, a sort or a page keeps — is a `## Backend` task plus an `F<n>` task for what the user sees. A prototype or a design shows what the user sees; it never decides where the work runs.
- Never write "the recipe is …" into `## Scope`. The builder walks the whole catalog itself, and one named recipe reads as the whole answer.
- A task that shows a machine's stage (a tab per stage, a stage label or badge, a stage filter) names the machine's reader module as the source of the stage's name and of the set of stages (`state-machines` Part C), even when the screen reads only a stored status column. Invoke the `state-machines` skill before you write it. A name the screen needs that the state's `meta` does not hold is a task on the machine, in the same checklist. In Step 2, search the repo for the machine's stage values and names; each map, list or union of them that a screen keeps is a task in the same checklist, which replaces it with the reader module's export.
- When the slice needs backend work, its `## Backend` section, written per the backend reference, comes first in the same file, and the file ends with `## E2E tests` and one `## Done` that merges both templates' items. The builder adds `## Backend` items only for a gap it discovers while integrating.
- `## Done` holds only what the builder can prove with output it can paste: a test run, a command, or the diff. The developer checks no screen and clicks through no flow: a step a person performs on the running app is an `E<n>` line. `## Manual verification` exists only for a check that no script can run, and the section is left out when the spec states none.
- A check the repo runs from a script is the builder's, even when it needs a key. When the script does not load its keys, the checklist's first task makes it (`dotenv -e .env -- …`), and the check is a Done item. The eval scripts (`eve eval`, mock or live) and a real turn (a message sent to the dev server, and the `eve traces` of it) are the exceptions: they call a model, so they are never a Done item, never an `E<n>` line, and a builder never runs them. They go under `## Manual verification`, as the developer's own run from the chat interface.

#### Template

Copy the template below. Replace each `<placeholder>` with this implementation checklist's content. Save it as `docs/<project>/checklists/NN-<slug>.md`.

```markdown
# NN — <checklist name>

## Scope

<What this builds.> Spec: `docs/<spec>.md`, section <section>.
Target: <app>, feature <slug>. Builds on: <earlier checklists, or none>.
Type: <Conventional Commits type>. Branch: `<type>/<slug>`.

## Designs

<Only when designs came with the spec; omit the section otherwise.>
The design is the source file. Each line says which state of the app shows it. The built screen looks like the design: the builder reads the source before it builds, and the design check compares the two.

- D1 `<Screen>` — <route `/path`, or the E line whose step opens it> — `docs/designs/<Screen>.dc.html`

## Frontend + Integration

### Behavior

- [ ] F1 <one task: an observable behavior in the words of the spec>

### Responsive

- [ ] V1 <one check at a width that has no design, with the width>

## E2E tests

Flow file: `packages/e2e/flows/<app>/<flow>.spec.ts`. The builder writes these tests after the build, as the `e2e-tests` skill states.

- [ ] E1 <a step, a failure path or an edge case, and its outcome, in the person's words>

## Manual verification

<Only for a check that no script can run; omit the section otherwise.>

## Done

- [ ] Every F item above is checked and shown; every V item is checked with the path of its screenshot.
- [ ] Every E item is checked: each line has a test or a `test.step` of that name, and `pnpm flows` printed its `N passed` line in this transcript.
- [ ] The full suite is green: the push's test summary pasted, or, when the repo pushes straight to main, the pushed commit's CI run id and `success` pasted.
- [ ] `git log` shows one commit per task, or the handoff's Deviations names each commit that holds two tasks.
- [ ] `docs/<project>/handoffs/NN-<slug>.md` exists.
- [ ] <verification the spec states and the builder can prove, copied word for word>
- [ ] The handoff's `## Review` section holds the one `review-frontend-feature` verdict, pasted whole: its count lines and its fail lines.
- [ ] The handoff's `## Review` section names the one commit, made after that review, that fixes its `fail` lines, or says `No fail line.` The review ran once; a second review is never run and never required.
- [ ] Tracker Status flipped to Done.
- [ ] PR open with its URL, opened as the `open-feature-pr` skill specifies, or the commit on main when the repo pushes straight to main.
```

### Step implementation checklist

How to write a step implementation checklist for work that only changes the code's structure, not what the software does. The `implement-steps` skill executes it in the /goal session, one step at a time.

#### How to fill it

- The `implement-steps` skill executes the checklist in the /goal session and loads the standards that the `Domain` line in `## Scope` names — `backend-standards` or `frontend-standards` with its matching recipes — and that skill governs the edits. The `implement-steps` skill also owns the branch, the baseline run, the review walk, and the PR. Write only the work into `## Steps` — no load-a-skill step, no branch step, no baseline step.
- Copy the spec's wording verbatim. Do not invent labels or microcopy.
- Write each step as a mechanical rule, never a vague intention. A mechanical rule names the files and the exact change, so that two builders produce the same diff from it.
  - Write: "move `apps/web/lib/email/` to `packages/email/src/`, and change every `@/lib/email` import to `@repo/email`"
  - Not: "extract the email code into its own package"
- `## Done` lists verification from two sources only. Do not write your own verification.
  1. The standing checks: the `test`/`test:run` and `typecheck` scripts of the affected packages, run unchanged, green at the baseline counts. No other command is a standing check.
  2. Verification the spec states, copied word for word. If a needed proof is not in the spec, ask the developer; the developer writes the decision into the spec.
- `## Done` holds only what the builder can prove with output it can paste. A spec-stated check that only a human can perform goes under `## Manual verification` — the developer runs it, not the builder. Leave that section out when the spec states none.

#### Template

Copy the template below. Replace each `<placeholder>` with this implementation checklist's content. Save it as `docs/<project>/checklists/NN-<slug>.md`.

```markdown
# NN — <checklist name>

## Scope

<What this implementation checklist does.> Spec: `docs/<spec>.md`, section <section>.
Builds on: <earlier checklists, or none>.
Type: <Conventional Commits type>. Branch: `<type>/<slug>`.
Domain: <backend or frontend — picks the governing rubric and the review skill>.

## Steps

1. <one concrete, completable step>

## Manual verification

- <verification the spec states that only the developer can perform>

## Done

Tick each box when you paste its output.

- [ ] <standing check command> green at baseline counts, output pasted.
- [ ] <verification the spec states and the builder can prove, copied word for word>
- [ ] The domain's one review verdict pasted whole (`review-backend-feature` or `review-frontend-feature`): its count lines and its fail lines.
- [ ] One commit, made after that review, fixes its `fail` lines, or the verdict has none. The review ran once; a second review is never run and never required.
- [ ] Tracker Status flipped to Done.
- [ ] PR open with its URL, opened as the `open-feature-pr` skill specifies, or the commit on main when the repo pushes straight to main.
```

## Tracker template

Copy the block below into `docs/<project>/tracker.md` and replace each `<placeholder>`.

````markdown
# <Project> — Tracker

Builders may edit only the Status and PR columns. Status is one of: Not started, In progress, Done.

| #   | Implementation checklist                  | Status      | PR  |
| --- | ----------------------------------------- | ----------- | --- |
| 01  | [<name>](checklists/01-<slug>.md)         | Not started | —   |

## Run commands

**01 — <name>**:

```
<the checklist's /goal run command, from Step 4 of the skill>
```
````
