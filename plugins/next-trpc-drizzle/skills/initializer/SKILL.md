---
name: initializer
description: Use with a decided design/spec doc (`/initializer <doc-path>`) to audit the repo and author a tracker plus builder-ready checklists. Each row gets a ready-to-paste /goal run command. `feat` rows get TDD checklists that drive build-backend-feature / build-frontend-feature. `chore`/`refactor` rows get step checklists. Refuses to invent semantics.
---

# Initializer — Spec → Tracker + Checklists

Turn a decided design doc into a tracker and per-row checklists. A builder must be able to run each checklist with zero further design work. `feat` rows run through `build-backend-feature` or `build-frontend-feature`. `chore`/`refactor` rows run through their own step checklist. One ready-made `/goal` command starts each row. **This skill only authors documents. Do not write code, tests, or scaffolding. Do not create branches.**

**Spec:** `$ARGUMENTS` — the path to the decided design doc. Read the full document before you do anything else.

A checklist is a **translation, not a design**. It has exactly three inputs:

1. **The spec — semantics.** Each behavior must trace to a decided sentence in the spec. Do not invent semantics. If the spec does not decide a behavior (a TTL, an error shape, a screen state, a conflict rule), **stop and ask the developer**. Do not design during authoring. If the audit shows that the spec is wrong about the repo, resolve the conflict with the developer. Then **write the resolution into the spec doc**. The checklist follows the amended spec. The checklist does not record corrections or their history. A checklist is immutable after a builder starts it. Keep the spec's copy verbatim. Do not invent labels, taglines, or microcopy.
2. **The skills — structure, naming, harness.** `backend-standards`, `backend-tests`, `frontend-standards`, and `testing` prescribe the feature tree, file suffixes, schema location, and test harnesses. Do not repeat their content. Do not override their content. The checklist only names the target app and the feature slug. Existing app code is not a reference. The skills are the standard.
3. **The repo — an audit pass, for repo-level facts only.** Audit the codebase against the spec. Find what exists, what you must add, and what must change to make the feature work. Also record workspace wiring: package filters, script names, turbo tasks, hook chain, and dependency versions. **Verify each path, command, and version against the repo in this session before you write it into a checklist.**

**The checklist speaks only to the builder.** Write instructions, mappings, target layouts, and the `## Done` list. Do not write verification evidence, spec corrections, derivation rationale, or "facts this relies on" into the checklist. Give that material to the developer in the session. Put spec corrections in the spec doc, per input 1. Test each sentence: if it explains why the checklist is correct, and not what to do, remove it. Do not add provenance notes in steps ("verified at `<commit>`", "the spec missed this"). State the instruction plainly.

## Types

Classify each tracker row by its Conventional Commits type before you decompose it:

- **`feat`** — the row adds or changes observable behavior. It gets a TDD checklist (below). `build-backend-feature` or `build-frontend-feature` builds it.
- **`chore` / `refactor`** — the row preserves behavior: extractions, moves, rewires, dependency or CI changes. There is no behavior list to TDD. Correctness means "nothing changed, and the `## Done` checks prove it". The row gets a step checklist. No build skill runs it. Its `/goal` points directly at the checklist.

## Placement

Build skill-governed features on the skills' ground: a new app or package laid out per the standards skills. The first feature carries the minimal scaffold. A legacy app with its own conventions is not a valid placement. Do not edit the skills to accommodate a placement conflict. Fix the placement instead.

## Decomposition — `feat` rows

Backend (`## Backend`):

- Split behaviors by layer. Group them under the source file they test: pure helpers → repository → service (→ entry when there is one). Write one test file per source file.
- One behavior = one test = one red-green-refactor cycle = one commit.
- Write each behavior as **observable behavior with expected values from the spec**. Do not write implementation steps. Write "`reserve` on an expired key treats it as absent", not "add a WHERE clause".
- For the first feature of a new app, list the **one-time scaffold** in Scope: package.json with `test`/`test:run`/`typecheck`/`db:generate` scripts, tsconfig, vitest backend project + setup, drizzle config, and `db/schema/`. The builder commits the scaffold as one initial chore commit before the first behavior.
- The schema and its generated migration ride the **first repository behavior's** cycle.
- Phrase behaviors within the limits of the harness. PGlite has a single connection, so a "concurrent" test uses `Promise.all` (serialized): assert the atomic outcome, not true parallelism. For an expiry test, seed rows with past timestamps. Do not demand clock injection.

Frontend (`## Frontend + Integration`, only when the feature has UI):

- Split the section into two groups. **Behavior (test-backed)**: what the user observes and does, the loading/error/empty states, and the integrated data path. **Visual & responsive (browser-checked, not tests)**: layout, spacing, tokens, and the `md:` state. jsdom has no layout engine. Do not write a Vitest test for a visual item.
- Trace each behavior item to the spec's screens and states. If a screen or state is undecided, ask.

Sizing: approximately 15 behaviors make one reviewable feature/PR. Split larger work into separate tracker rows.

## Decomposition — `chore`/`refactor` rows

- Write ordered steps (`## Steps`). Each step is a concrete, completable unit: branch + baseline, create X, move Y, rewrite Z, update CI. Write mechanical rules, not vague intentions: "rewrite `@/lib/db/*` → `@ajiri/db/*` per this mapping", not "fix imports".
- The first step is the **baseline**. Run the repo's standing checks for the affected packages. Record the results. Show them green. The baseline shows which later step causes a regression.
- `## Done` lists verification from two sources only. Do not write your own verification.
  1. **The repo's standing checks**: the `test`/`test:run` and `typecheck` scripts of the affected packages. Run them without changes. They must show green at the baseline counts. No other command is a standing check.
  2. **Verification that the spec states.** Copy it word for word. If a necessary proof is not in the spec, ask the developer. The developer writes the decision into the spec.

  Also list the tracker flip and the PR. Run the standing checks one time during the audit. Record the results. If a check is red on the default branch, stop. Ask the developer to resolve it before you author the row.
- The builder ticks each `## Done` box (`[ ]` → `[x]`) when the builder pastes its output. The ticked boxes are part of a satisfied row.

## Output

Author the **tracker and all checklists in one pass**. Order the rows so that each feature depends only on earlier rows.

Write the files under a docs folder for the project (for example, `docs/<project>/`):

- `tracker.md` — one row per feature: number, name, checklist path, status, PR, and the row's ready-to-paste **run command** (see below). Builders may edit only the Status and PR columns.
- `checklists/NN-<slug>.md` — one per row. **`chore`/`refactor` rows:** the sections are `## Scope` → `## Steps` → `## Done`, per the chore decomposition above. **`feat` rows:** the sections, in order:
  - **`## Scope`** — what this builds, the spec pointer (doc + section), the target app + feature slug, the one-time scaffold list (first feature of an app only), and `Builds on:`.
  - **`## Skills`** — the skills the build runs under. This section is documentation only. The builder agent's preload delivers the skills, not this section.
  - **`## Backend`** — the behavior list that `build-backend-feature` works through: unchecked boxes grouped under source-file headings.
  - **`## Frontend + Integration`** (features with UI) — the list that `build-frontend-feature` works through, split into Behavior and Visual & responsive as above.
  - **`## Manual verification`** — commands the developer runs. Verify them against the scaffold that this checklist defines.
  - **`## Done`** — transcript-visible artifacts only: all boxes checked and shown, green suite output pasted, `git log` that shows one commit per behavior, the handoff file exists, the tracker row flipped, and the PR open with its URL and a What/Why/How/Verification body. Add only the invariants that the spec states. Copy them word for word. Do not write your own invariants. Do not include a claim that a transcript cannot show.

## Run commands

Each tracker row carries the exact `/goal` command that the developer pastes to run it. There is one shape per type.

`feat` rows:

```
/goal the build-backend-feature skill was run on docs/<project>/checklists/NN-<slug>.md and every item in its Done section is shown satisfied in the transcript
```

`chore`/`refactor` rows (no build skill — the checklist is the procedure):

```
/goal every step and every Done item in docs/<project>/checklists/NN-<slug>.md is shown satisfied in the transcript; for each Done item the pasted proof is the command, its final summary output, and its exit status — full output is not required
```

Two rules for the `feat` command. First, write the build skill's name in the command. Claude loads a skill reliably only when the user types its name. A name inside a file does not load the skill. Second, write "the skill was run" in the condition. The checker then blocks the finish until the conversation shows that the skill was used.

Two rules for both commands. Keep the condition under 4,000 characters. Demand only evidence that can appear in the conversation: pasted output, a PR URL, a ticked checklist. The checker cannot run commands or open files. It reads only the conversation. The `## Done` section exists to supply this evidence.

**Stop at authoring.** Present the tracker and the checklists for developer review. Building is the build skills' job. The developer fires each run command when ready.
