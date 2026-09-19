---
name: implementation-planner
description: Converts a spec doc into a tracker and implementation checklists. Each implementation checklist is one PR and holds the tasks that implement it. The tracker lists every implementation checklist with its status and its /goal run command. Work that changes what the software does gets a TDD implementation checklist, which a builder implements with TDD. Work that only changes the code's structure gets a step implementation checklist, which the implement-steps skill executes step by step. The skill audits the repo first, and asks the developer when the spec leaves a decision open. Use when the developer runs /jig:implementation-planner with a doc path, or asks to plan a spec's implementation, to split a spec doc into checklists or PRs, or to write a spec's project tracker.
---

# Implementation planner

Author documents only. Do not write code or tests. Do not create branches. Do not run the implementation checklists.

## Instructions

### Step 1: Read the spec

The spec is the doc at `$ARGUMENTS`. Read the full document.

### Step 2: Audit the repo

Read the codebase and collect the context this spec's implementation checklists need: what already exists, what must be added, what must change to implement the spec. Every fact about the repo that you write into an implementation checklist must be verified against the repo in this session, not from memory.

### Step 3: Resolve gaps with the developer

Two kinds of gap stop the work:

1. The spec leaves undecided a detail the implementation checklists need.
2. The audit shows the spec is wrong about the repo.

In both cases, ask the developer. Write the resolution into the spec doc. Then continue from the amended spec. Do not design the answer yourself.

Every resolution you write into the spec carries a `Developer said:` line that quotes the developer's answer word for word, from this session. A resolution with no such line is one you designed: delete it and report the gap as open. The quote is the audit trail Step 5 checks.

### Step 4: Split the work into implementation checklists

Split the spec's work into implementation checklists. One implementation checklist is one PR, and one PR is one slice: the smallest change a person can verify on the running app. A slice carries everything that outcome needs — the backend, the frontend, and any migration, agent tool, eval, machine, hook or seed on the path between them. A backend change nobody can see on a screen is not a slice: it belongs inside the slice that makes it visible. Order the checklists so that each one depends only on earlier ones.

A builder is the agent that executes one implementation checklist, task by task, in a run the developer starts with the checklist's /goal command.

Write each implementation checklist as `docs/<project>/checklists/NN-<slug>.md`. One question decides which checklist to write: **does the work change what the software does?**

- Yes: write one TDD implementation checklist for the slice. Its `## Backend` section follows the **TDD implementation checklist — backend** section of this skill and its `## Frontend + Integration` section follows the **TDD implementation checklist — frontend** section of this skill; a slice that touches both domains holds both sections in the one file, backend first. Every TDD checklist has a `## Manual verification` section with at least one step a person performs on the running app; a checklist that cannot name one is not a slice — merge its work into the slice that makes it visible. Before you write the first section of a domain, invoke that domain's tests skill (`backend-tests` or `frontend-tests`). Its Review checklist defines the tests the builder writes — write every task so its tests can pass that checklist.
- No — the work only changes the code's structure: write a step implementation checklist, per the **Step implementation checklist** section of this skill. Its `Domain` line names the domain.
- Work that changes both behavior and structure: split it into a TDD checklist and a step checklist. If the answer is unclear, ask the developer.

When mockup images come with the spec, transcribe each image into a `## Design facts` section in the frontend checklist, as the **TDD implementation checklist — frontend** section of this skill specifies. Read every image in this session. An image the spec references but you cannot see is a Step 3 gap — ask the developer for it.

Also give each implementation checklist its Conventional Commits type (`feat`, `fix`, `chore`, `refactor`, ...). The type names its branch and PR title. It does not decide which checklist to write.

Then write the tracker as `docs/<project>/tracker.md` — fill the **Tracker template** at the end of this skill. The tracker carries each implementation checklist's /goal run command:

For a TDD implementation checklist with both a `## Backend` and a `## Frontend + Integration` section:

```
/goal the implement-backend skill was run on docs/<project>/checklists/NN-<slug>.md for its Backend section, then the implement-frontend skill was run on the same checklist for its Frontend + Integration section, and every item in its Done section is shown satisfied in the transcript
```

For a TDD implementation checklist with only a `## Backend` section:

```
/goal the implement-backend skill was run on docs/<project>/checklists/NN-<slug>.md and every item in its Done section is shown satisfied in the transcript
```

For a TDD implementation checklist with only a `## Frontend + Integration` section:

```
/goal the implement-frontend skill was run on docs/<project>/checklists/NN-<slug>.md and every item in its Done section is shown satisfied in the transcript
```

For a step implementation checklist:

```
/goal the implement-steps skill was run on docs/<project>/checklists/NN-<slug>.md and every step and every Done item in it is shown satisfied in the transcript; for each Done item the pasted proof is the command, its final summary output, and its exit status — full output is not required
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
9. When mockup images came with the spec, each frontend TDD implementation checklist must have a `## Design facts` section, and every `D<n>` number a `V<n>` item cites must exist in that section.
10. Every resolution this run wrote into the spec has a `Developer said:` line quoting the developer's own message from this session. A resolution without one is deleted, and its gap is reported as open in the run's final report.
11. No `## Manual verification` item names a script the repo can run. One that does moves to `## Done`, with the task that makes the script load its own keys when it needs them.
12. Every TDD implementation checklist has a `## Manual verification` section with at least one step a person performs on the running app. One without it is not a slice: merge its work into the checklist that makes it visible, and renumber nothing that was already in the tracker.

When every check passes, you are done.

## When a step fails

- **`$ARGUMENTS` is empty, or the spec doc does not exist.** Do not guess a path. Ask the developer for the spec doc's path.
- **The developer does not resolve a gap from Step 3.** Stop and report the open question. Never design the answer yourself. Never write a checklist over a gap.
- **`docs/<project>/tracker.md` already exists.** Add this run's rows and run commands to it. Keep every row that is already there, with its number and its Status. Never renumber an existing implementation checklist.
- **A Step 5 check fails twice on the same file.** Stop and report the file, the failing check, and the fix you tried. A tracker with a wrong link or a wrong run command is worse than no tracker.

## Checklist formats

Step 4 writes every checklist to one of these three formats.

### TDD implementation checklist — backend

How to write a TDD implementation checklist for backend work that changes what the software does. The builder (implement-backend) implements it with TDD, one task at a time.

#### How to fill it

- Copy the spec's wording verbatim. Do not invent labels or microcopy.
- Write each task so its tests can pass the Review checklist of the `backend-tests` skill (invoked in Step 4): one observable behavior, expected values from the spec, testable in its layer's test setup.
- Each failure path the spec states is a behavior: give it its own task. The task list is the feature's coverage contract — a behavior with no task gets no test.
- Each entry-point call the checklist adds or changes (a procedure, an MCP tool, an eve tool, a workflow step) gets one statement-budget task. List the statements the behavior needs, one per row set read or written, and write the count and the list into the task. The builder's test asserts that exact count on the real database (`backend-standards` § "Queries & performance"; `backend-tests` Review item 14). Derive the list from the spec and the repo audit, never from a run.
- If the implementation checklist creates a new app or package, list its setup in Scope: package.json with the standard scripts, tsconfig, vitest setup, drizzle config, `db/schema/`.
- `## Done` holds only what the builder can prove with output it can paste: a test run, a command, or the diff. A spec-stated check that only a human can perform goes under `## Manual verification` — the developer runs it, not the builder. `## Manual verification` is never empty: at least one step a person performs on the running app, because the checklist is a slice.
- When the slice also has a `## Frontend + Integration` section, the two sections share one file: `## Backend` first, then `## Frontend + Integration`, then one `## Manual verification` and one `## Done` at the end that merges both templates' items. The backend run proves the Backend items and pushes the branch; the frontend run proves the rest and opens the one PR.
- A check the repo runs from a script is the builder's, even when it needs a key. When the script does not load its keys, the checklist's first task makes it (`dotenv -e .env -- …`), and the check is a Done item. Only a check with no script (a browser, a device, a person) is manual.

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

- [ ] Every task box above is checked and shown.
- [ ] Green suite output pasted.
- [ ] `git log` shows one commit per task.
- [ ] `docs/<project>/handoffs/NN-<slug>.md` exists.
- [ ] <verification the spec states and the builder can prove, copied word for word>
- [ ] Tracker Status flipped to Done.
- [ ] PR open with its URL, opened as the `open-feature-pr` skill specifies.
- [ ] The `review-backend-feature` verdict pasted: one line per item, plus its suite run.
```

### TDD implementation checklist — frontend

How to write a TDD implementation checklist for frontend work that changes what the software does. The builder (implement-frontend) implements it with TDD, one task at a time.

#### How to fill it

- Copy the spec's wording verbatim. Do not invent labels, headings, or microcopy.
- Split the tasks into **Behavior (test-backed)** `F<n>` items and **Visual & responsive (browser-checked, never jsdom tests)** `V<n>` items. A behavior is testable in jsdom through what the user sees and does; layout, spacing, and breakpoints are not — they go under `V<n>`.
- When mockup images come with the spec, add a `## Design facts` section: one `D<n>` statement per checkable fact, grouped by image. A fact states one thing the image shows — a part, its position or order, its count, its alignment, its variant, or its copy word for word. Never write a pixel size or a color read off the image: the codebase's design system supplies the tokens, so a fact says "icon-only", "muted", or "beside the day name" — never "32px" or "#6b7280".
- Write each `V<n>` item to cite the `D<n>` facts it verifies, e.g. `V2 (D4–D7) At 768 ...`. A fact about copy, counts, or states is jsdom-testable — cover it with an `F<n>` item.
- When you write a `## Design facts` section, add this item to `## Done`: `- [ ] One verdict per D item pasted: pass, fixed with file:line, or browser-check.` It makes the builder's fact walk visible to the /goal watcher.
- Write each `F<n>` task so its tests can pass the Review checklist of the `frontend-tests` skill (invoked in Step 4): one observable behavior, expected values from the spec, driven through what the user sees and does.
- Before you write the first `F<n>` task, invoke the `frontend-standards` skill and walk its catalog row by row against the slice. For every row that matches, invoke that row's `recipe-*` skill, and write the tasks to agree with it. A behavior that a recipe's Don't list forbids is never a task. Work that a recipe puts on the server — the rows a search, a filter, a sort or a page keeps — is a `## Backend` task plus an `F<n>` task for what the user sees. A prototype or a mockup shows what the user sees; it never decides where the work runs.
- Never write "the recipe is …" into `## Scope`. The builder walks the whole catalog itself, and one named recipe reads as the whole answer.
- Each failure path and each empty state the spec states is a behavior: give it its own `F<n>` task. The task list is the feature's coverage contract — a behavior with no task gets no test.
- When the slice needs backend work, its `## Backend` section, written per the backend reference, comes first in the same file, and the file ends with one `## Manual verification` and one `## Done` that merge both templates' items. The builder adds `## Backend` items only for a gap it discovers while integrating.
- `## Done` holds only what the builder can prove with output it can paste: a test run, a command, or the diff. A spec-stated check that only a human can perform goes under `## Manual verification` — the developer runs it, not the builder. `## Manual verification` is never empty: at least one step a person performs on the running app, because the checklist is a slice.
- A check the repo runs from a script is the builder's, even when it needs a key. When the script does not load its keys, the checklist's first task makes it (`dotenv -e .env -- …`), and the check is a Done item. Only a check with no script (a browser, a device, a person) is manual.

#### Template

Copy the template below. Replace each `<placeholder>` with this implementation checklist's content. Save it as `docs/<project>/checklists/NN-<slug>.md`.

```markdown
# NN — <checklist name>

## Scope

<What this builds.> Spec: `docs/<spec>.md`, section <section>.
Target: <app>, feature <slug>. Builds on: <earlier checklists, or none>.
Type: <Conventional Commits type>. Branch: `<type>/<slug>`.

## Design facts

<Only when mockup images came with the spec; omit the section otherwise.>
Transcribed from the mockup images. The builder builds to these statements, and the builder and the reviewer each walk them against the diff.

### <image 1: what it shows>

- D1 <one checkable statement from the image>

## Frontend + Integration

### Behavior (test-backed)

- [ ] F1 <one task: an observable behavior with expected values from the spec>

### Visual & responsive (browser-checked, never jsdom tests)

- [ ] V1 <one visual or responsive check, with its breakpoints>

## Manual verification

- <check the developer performs in the browser>

## Done

- [ ] Every F item above is checked and shown; every V item is checked or listed as browser-check.
- [ ] Green `vitest` output pasted.
- [ ] `git log` shows one commit per task.
- [ ] `docs/<project>/handoffs/NN-<slug>.md` exists.
- [ ] <verification the spec states and the builder can prove, copied word for word>
- [ ] Tracker Status flipped to Done.
- [ ] PR open with its URL, opened as the `open-feature-pr` skill specifies.
- [ ] The `review-frontend-feature` verdict pasted: one line per item, plus its suite run.
```

### Step implementation checklist

How to write a step implementation checklist for work that only changes the code's structure, not what the software does. The `implement-steps` skill executes it in a forked builder, one step at a time.

#### How to fill it

- The `implement-steps` skill executes the checklist in a forked builder that has the `backend-standards` and `frontend-standards` skills preloaded — the `Domain` line in `## Scope` picks which one governs the edits. The `implement-steps` skill also owns the branch, the baseline run, the review walk, and the PR. Write only the work into `## Steps` — no load-a-skill step, no branch step, no baseline step.
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
- [ ] Tracker Status flipped to Done.
- [ ] PR open with its URL, opened as the `open-feature-pr` skill specifies.
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
