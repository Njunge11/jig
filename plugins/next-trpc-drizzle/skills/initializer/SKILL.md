---
name: initializer
description: Use with a decided design/spec doc (`/initializer <doc-path>`) to audit the repo and author a tracker + builder-ready checklists, each with a ready-to-paste /goal run command — TDD checklists driving build-backend-feature / build-frontend-feature for feature work, step-and-gates checklists for refactor/chore work. Refuses to invent semantics.
---

# Initializer — Spec → Tracker + Checklists

Turn a decided design doc into a tracker and per-row checklists executable with zero further design work — feature rows driven through `build-backend-feature` / `build-frontend-feature`, chore/refactor rows through their own step-and-gates checklist — each kicked off later by one ready-made `/goal` command. **Authoring only: no code, no tests, no scaffolding, no branches.**

**Spec:** `$ARGUMENTS` — the path to the decided design doc. Read it fully before anything else.

A checklist is a **translation, not a design**. It has exactly three inputs:

1. **The spec — semantics.** Every behavior must trace to a decided sentence in the spec. Invent zero semantics: if the spec hasn't decided a behavior (a TTL, an error shape, a screen state, a conflict rule), **stop and ask the developer** — never design on the fly. When the audit proves the spec wrong about the repo, resolve it with the developer and **write the resolution into the spec doc** — the checklist follows the amended spec and never carries corrections or their history itself. A checklist is immutable once a builder starts it. Preserve the spec's copy verbatim — never invent labels, taglines, or microcopy.
2. **The skills — structure, naming, harness.** `backend-standards`, `backend-tests`, `frontend-standards`, and `testing` prescribe the feature tree, file suffixes, schema location, and test harnesses. Repeat none of it, override none of it — the checklist only names the target app and feature slug. Existing app code is not a reference; the skills are the standard.
3. **The repo — an audit pass, for repo-level facts only.** Audit the codebase against the spec: what already exists, what must be added, what must change to get the feature working — plus workspace wiring (package filters, script names, turbo tasks, hook chain, dep versions) and spec-adjacent constraints. **Never write a path, command, or version into a checklist that wasn't verified against the repo in this session.**

**The checklist speaks only to the builder** — instructions, mappings, target layouts, and gates. Verification evidence, spec corrections, derivation rationale, and "facts this relies on" go to the developer in the session (and into the spec doc, per input 1) — never into the checklist. Test every sentence: if it explains *why the checklist is right* instead of *what to do*, cut it. No provenance asides inside steps ("verified at `<commit>`", "the spec missed this") — state the instruction plainly.

## Lanes

Classify every tracker row before decomposing it:

- **Feature** — adds or changes observable behavior. Gets a TDD checklist (below) and is built by `build-backend-feature` / `build-frontend-feature`.
- **Chore/refactor** — behavior-preserving work: extractions, moves, rewires, dependency or CI changes. There is no behavior list to TDD — correctness is "nothing changed, proven by the gates." Gets a step-and-gates checklist; no build skill; its `/goal` points straight at the checklist.

## Placement

Skill-governed features are built on the skills' ground: a new app/package laid out per the standards skills, with the first feature carrying the minimal scaffold. A legacy app with its own conventions is not a valid placement, and the skills are never edited to accommodate a placement conflict — fix the placement instead.

## Decomposition — feature lane

Backend (`## Backend`):

- Split behaviors by layer, grouped under the source file they test: pure helpers → repository → service (→ entry when there is one). One test file per source file.
- One behavior = one test = one red-green-refactor cycle = one commit.
- Behaviors are **observable behavior with expected values from the spec** — never implementation steps. ("`reserve` on an expired key treats it as absent", not "add a WHERE clause".)
- The first feature of a new app lists its **one-time scaffold** explicitly in Scope (package.json with `test`/`test:run`/`typecheck`/`db:generate` scripts, tsconfig, vitest backend project + setup, drizzle config, `db/schema/`), committed as one initial chore commit before the first behavior.
- Schema + generated migration ride the **first repository behavior's** cycle.
- Phrase behaviors within the harness's testability limits: PGlite is single-connection, so "concurrent" tests are `Promise.all` (serialized) — assert the atomic outcome, not true parallelism; expiry tests seed rows with past timestamps instead of demanding clock injection.

Frontend (`## Frontend + Integration`, only when the feature has UI):

- Split the section into two groups: **Behavior (test-backed)** — what the user observes/does, loading/error/empty states, the integrated data path — and **Visual & responsive (browser-checked, not tests)** — layout, spacing, tokens, the `md:` state. jsdom has no layout engine; never write a Vitest test for a visual item.
- Behavior items trace to the spec's screens and states; if a screen or state is undecided, ask.

Sizing: ~15 behaviors is one reviewable feature/PR — split anything larger into separate tracker rows.

## Decomposition — chore/refactor lane

- Ordered steps (`## Steps`), each a concrete, completable unit (branch + baseline, create X, move Y, rewrite Z, update CI) — mechanical rules over vague intentions ("rewrite `@/lib/db/*` → `@ajiri/db/*` per this mapping", not "fix imports").
- The first step is always a **baseline shown green** (the suites/checks that must stay green, plus a no-op proof where one exists, e.g. `db:generate` reports no changes) so regressions are attributable.
- `## Done` is the gates: the exact commands whose green output proves the work is behavior-neutral (typecheck, affected suites, no-op generates, knip), each pasted in the transcript — plus the PR and the lane's invariants.

## Output

Author the **tracker and all checklists in one pass**, ordered so each feature depends only on earlier ones.

Files, under a docs folder for the project (e.g. `docs/<project>/`):

- `tracker.md` — one row per feature: number, name, checklist path, status, PR, and the feature's ready-to-paste **run command** (see below). Builders may edit only Status/PR.
- `checklists/NN-<slug>.md` — one per row. **Chore/refactor lane:** sections are `## Scope` → `## Steps` → `## Done` (per the chore decomposition above). **Feature lane:** sections in order:
  - **`## Scope`** — what this builds, spec pointer (doc + section), target app + feature slug, the one-time scaffold list (first feature of an app only), and `Builds on:`.
  - **`## Skills`** — names the skills the build runs under. Documentation only — delivery is the builder agent's preload, never this section.
  - **`## Backend`** — the behavior list `build-backend-feature` burns down: unchecked boxes grouped under source-file headings.
  - **`## Frontend + Integration`** (features with UI) — the list `build-frontend-feature` burns down, split into Behavior and Visual & responsive as above.
  - **`## Manual verification`** — commands the developer actually runs, verified against the scaffold this checklist itself defines.
  - **`## Done`** — transcript-visible artifacts only: all boxes checked and shown, green suite output pasted, `git log` showing one commit per behavior, handoff file exists, tracker row flipped, PR open with URL and What/Why/How/Verification body — plus the feature's invariants (e.g. no migration applied, backend phase touches no frontend files). Never gate on a claim a transcript can't show.

## Run commands

Each tracker row carries the exact `/goal` command the developer pastes to run it — one shape per lane:

Feature lane:

```
/goal the build-backend-feature skill was run on docs/<project>/checklists/NN-<slug>.md and every item in its Done section is shown satisfied in the transcript
```

Chore/refactor lane (no build skill — the checklist is the procedure):

```
/goal every step and every Done item in docs/<project>/checklists/NN-<slug>.md is shown satisfied in the transcript, including pasted green output for each gate
```

Two rules make the feature shape work: the build skill is **named in the command itself** — skill invocation is only guaranteed when it's in the typed prompt, never when it's merely mentioned inside a file the session reads — and "the skill was run" is part of the goal condition, so the evaluator enforces the machinery, not just the outcome. Both shapes: keep the condition under 4,000 characters, and gate only on things the transcript can show (the `## Done` section is written for exactly this — the goal evaluator calls no tools and sees only what the session surfaces).

**Stop at authoring.** Present the tracker + checklists for developer review; building is the build skills' job — the developer fires each run command when ready.
