# TDD implementation checklist

How to write a TDD implementation checklist for work that changes what the software does. The builder (build-backend-feature or build-frontend-feature) implements it with TDD, one task at a time.

## Writing rules

- Copy the spec's wording verbatim. Do not invent labels, taglines, or microcopy.
- The checklist speaks only to the builder. Do not write rationale, provenance notes, spec corrections, or verification evidence into it.
- The standards skills (`backend-standards`, `backend-tests`, `frontend-standards`, `testing`) prescribe structure, naming, and harness. Do not repeat their content. Do not override it. Existing app code is not a reference.
- A checklist is immutable after a builder starts it.

## Template

Copy `assets/tdd-implementation-checklist-template.md`. Replace each `<placeholder>` with this checklist's content, following the Section rules below. Save the result as `docs/<project>/checklists/NN-<slug>.md`.

## Section rules

### Scope

- Build in a new app or package laid out per the standards skills. Never in a legacy app.
- Do not edit the skills to fit a placement conflict. Fix the placement.
- First checklist of a new app only — list the one-time scaffold: package.json with `test`/`test:run`/`typecheck`/`db:generate` scripts, tsconfig, vitest backend project + setup, drizzle config, `db/schema/`. The builder commits it as one chore commit before the first task.

### Backend

- Each task is one observable behavior with expected values from the spec, never an implementation step.
  - Write: "`reserve` on an expired key treats it as absent"
  - Not: "add a WHERE clause"
- Group tasks under the source file they test: pure helpers → repository → service → entry (when there is one). One test file per source file.
- One task = one test = one red-green-refactor cycle = one commit.
- The schema and its migration ride the first repository task's cycle.
- Stay inside the harness limits. PGlite has one connection:
  - Concurrency: `Promise.all`, assert the atomic outcome.
  - Expiry: seed rows with past timestamps. No clock injection.

### Frontend + Integration

- Behavior tasks (test-backed): what the user observes and does, the loading/error/empty states, the integrated data path.
- Visual & responsive tasks (browser-checked): layout, spacing, tokens, the `md:` state. No tests for visual tasks.
- Trace each task to the spec's screens and states. If a screen or state is undecided, ask the developer.

### Manual verification

- Commands the developer runs by hand. Verify each one against the scaffold this checklist defines.

### Done

- Only artifacts a transcript can show.
- Invariants: only those the spec states, copied word for word. Write none of your own.
- Last two items: the tracker flip, then the PR.

## Run command

The checklist's /goal run command for the tracker:

```
/goal the build-backend-feature skill was run on docs/<project>/checklists/NN-<slug>.md and every item in its Done section is shown satisfied in the transcript
```

Two rules for this command:

- Write the build skill's name in the command. A skill loads only when the developer types its name.
- Write "the skill was run" in the condition, so the /goal evaluator requires the conversation to show that the skill was used.

Rules for every /goal condition: keep it under 4,000 characters. Demand only evidence that can appear in the conversation: pasted output, a PR URL, a ticked checklist. The evaluator reads only the conversation; it cannot run commands or open files.
