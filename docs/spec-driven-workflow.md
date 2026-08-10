# Spec-Driven TDD Workflow

Status: draft for review. Not implemented.

A developer writes a product spec; an implementation-planner agent decomposes it into an ordered, immutable list of feature checklists (one feature = one PR); each feature is then built by an agent via `/goal implement <checklist>` using red-green-refactor TDD, with context carried between features by git history and a small handoff doc.

## Roles

| Role | Who | Does |
|---|---|---|
| Developer | Human | Writes the spec, kicks off each feature with `/goal`, reviews and merges PRs |
| Implementation-planner agent | Claude (new skill) | Decomposes the spec into tracker + ordered checklists. Runs once per project |
| Feature agent | Claude (`/goal` + existing build skills) | Builds one feature test-first, commits per behavior, writes handoff, opens PR |
| Evaluator | Claude Code built-in (goal mode) | After every turn, judges the checklist's completion condition from visible transcript output |

## Artifacts

```
docs/<project>/
  spec.md                      # product spec, written by the developer
  tracker.md                   # ordered feature table with status — the project's state
  checklists/
    01-<feature>.md            # one per feature, authored by the implementation-planner
    02-<feature>.md
  handoffs/
    01-<feature>.md            # one per feature, written by the agent that built it
```

### Tracker

| # | Feature | Checklist | Status | PR |
|---|---|---|---|---|
| 1 | invitations schema | checklists/01-invitations-schema.md | done | #12 |
| 2 | invitations service | checklists/02-invitations-service.md | in progress | |

Created by the implementation-planner. **Immutable except the Status/PR columns**: a feature agent may only flip its own row. No agent adds, removes, reorders, or rewords features. (Prevents an agent from rewriting the plan to match what it built — the `passes`-flag rule from Anthropic's long-running-agent harness.)

### Checklist (one per feature)

Structure: **Scope → Behaviors → Manual verification → Done.**

- **Scope** — exactly what this feature covers, and which prior features it builds on.
- **Skills** — names the skills that govern the work, e.g. "built per the `backend-tests` and `backend-standards` skills." This section is documentation, not the delivery mechanism: skills reach the agent by **preload** — the executor agent's `skills:` frontmatter injects them into context at startup, unconditionally. Naming a skill in prose and hoping the model fetches it is discretionary and is never relied on; the Done section then checks the *artifacts* of compliance (failing-then-passing runs, per-behavior commits), which is the enforceable part.

  Test skills are restructured for instruction-following: `tdd` + `testing` (+ `backend.md`/`ui.md`) collapse into two fully self-contained skills, `backend-tests` and `frontend-tests` — each one file with the TDD loop (red → self-check → green → refactor → commit per behavior), a what-to-assert table, do/don't examples, and harness wiring. The loop is duplicated in both by design: they're never co-loaded with a shared loop skill, and self-containment beats DRY for agent compliance. No skill references another skill (references one level deep — nested chains cause partial reads, per Anthropic's authoring guidance). The old `tdd` build-order rule (backend → UI tests → integrate) moves to the implementation-planner's decomposition rules.

  **Checklist convention:** every standards-type skill (standards, tests — not thin orchestrators) ends with a section titled `## Review checklist`, opening `Reject the <unit> if any is true:`, followed by numbered, violation-phrased items — numbered so other sections can cite `#4`, violation-phrased so each item is a binary reject condition walked row-by-row. `backend-standards` and `backend-tests` conform; future skills must too.
- **Behaviors** — the work, written as a list of tests. Each behavior is one red-green-refactor cycle and one commit. Immutable: the agent checks items off, never edits them.
- **Manual verification** — steps the developer runs when reviewing the PR.
- **Done** — the machine-checkable completion condition for the `/goal` evaluator. Must be phrased around observable output, e.g.:
  - every behavior above is checked off
  - the skills named in the Skills section were invoked (skill invocations are visible in the transcript, so the evaluator can enforce this)
  - full test suite run with `pnpm test` and passing output shown in the transcript
  - one commit per behavior in `git log`
  - `handoffs/NN-<feature>.md` written
  - tracker row flipped to done
  - the PR is open, its URL is shown, and its body carries the What/Why/How/Verification sections (the `gh pr create` call is visible in the transcript)

Ordering rule: each checklist depends only on features before it, so the PR chain never blocks.

### Handoff (one per feature, written at the end)

Concise. A short summary of what changed, plus:

| File | Why touched |
|---|---|

That's it. Code is the authority — the handoff is a pointer, not documentation. Deviations from the checklist's assumptions are the most important content ("checklist said X, built Y because Z"), since later checklists were authored against the planned shape, not the built one.

## Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│  SETUP (once per project)                                              │
│                                                                        │
│  Developer                Implementation-planner skill                            │
│  ┌─────────┐   /decompose  ┌──────────────────┐                        │
│  │ spec.md │ ────────────▶ │ split into ordered│                       │
│  └─────────┘               │ features, author  │                       │
│                            │ checklists        │                       │
│                            └────────┬─────────┘                        │
│                                     │ writes                           │
│                                     ▼                                  │
│                  tracker.md          checklists/01.md … NN.md          │
│                  (feature table,     (Scope · Skills · Behaviors ·     │
│                   status flips only)  Manual verification · Done)      │
└────────────────────────────────────────────────────────────────────────┘
                                      │
                     developer reviews artifacts once
                                      │
┌─────────────────────────────────────▼──────────────────────────────────┐
│  PER FEATURE (repeats N times, in order)                               │
│                                                                        │
│  Developer: /goal implement checklists/NN-<feature>.md                 │
│                                      │                                 │
│                                      ▼                                 │
│  ① READ CONTEXT                                                        │
│     tracker.md  +  handoffs/(NN-1).md   ← previous feature only        │
│     (code itself read lazily, on demand — it's the authority)          │
│                                      │                                 │
│                                      ▼                                 │
│  ② BUILD — for each behavior in the checklist:                         │
│     ┌──────────────────────────────────────────────┐                   │
│     │ invoke skills named in checklist              │                  │
│     │ (backend-tests · backend-standards · …)       │                  │
│     │                                               │                  │
│     │   write failing test ──▶ make green ──▶       │  ×  per          │
│     │   refactor (if needed) ──▶ COMMIT             │     behavior     │
│     │   check the behavior off                      │                  │
│     └──────────────────────────────────────────────┘                   │
│                                      │                                 │
│                                      ▼                                 │
│  ③ EXIT                                                                │
│     run full suite (output in transcript)                              │
│     write handoffs/NN.md  (summary + files-touched table + deviations) │
│     flip tracker row ──▶ open PR                                       │
│                                      │                                 │
│          after every turn ┌──────────▼─────────┐                       │
│          ─────────────────│ /goal EVALUATOR    │  reads transcript     │
│          ─────────────────│ Done condition met?│  only                 │
│                           └──────┬──────┬──────┘                       │
│                             no   │      │  yes                         │
│                    next turn ◀───┘      ▼                              │
│                                  goal clears                           │
│                                      │                                 │
│                                      ▼                                 │
│  Developer: review PR (Manual verification steps) ──▶ merge            │
│                                      │                                 │
│                └─────────────────────┘                                 │
│                feature N+1 starts, reading handoffs/NN.md              │
└────────────────────────────────────────────────────────────────────────┘
```

## The loop

```
Developer: write spec.md
Developer: run implementation-planner → tracker + checklists (review them once)

For each feature, in order:
  Developer:  /goal implement docs/<project>/checklists/NN-<feature>.md
  Agent:      read tracker + previous feature's handoff
              ("here's what was built before you — you may not need it,
               but hold it while you work")
  Agent:      for each behavior: write failing test → make it green →
              refactor if needed → commit
  Agent:      write handoffs/NN-<feature>.md, flip tracker row
  Agent:      open PR
  Evaluator:  confirms the checklist's Done condition from transcript output
  Developer:  review PR, merge, kick off next feature
```

## Rules

1. One feature = one branch = one PR.
2. One behavior = one test = one commit. The git log is the step-by-step record of the feature.
3. Checklists and tracker are immutable to agents except status flips.
4. Context between features = code + git history, lazily read. The handoff is ambient context only; the next agent reads **only the previous feature's handoff**, not the whole stack — anything older it recovers from code on demand. Injected context stays constant-size regardless of project length.
5. No suite re-run at session start — the merged PR already proved green; CI owns the merge gate.
6. Code wins over prose. Handoffs and tracker never substitute for reading the code.

## Grounding

- [Effective harnesses for long-running agents](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents) — progress file, immutable feature list with flip-only status, descriptive commits, session-start reading ritual.
- [Effective context engineering for AI agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents) — structured note-taking; condensed handoffs over transcripts.
- [Claude Code /goal](https://code.claude.com/docs/en/goal) — evaluator judges only visible transcript output; conditions need a named command, shown output, and an invariant clause.
- [GitHub Spec Kit](https://github.com/github/spec-kit) — spec → plan → tasks, each phase a markdown artifact feeding the next.

The handoff format (summary + files table) and its consume-only-previous rule are our own design, not published practice.

## Parked — skill evals

Deferred, to revisit after real usage. Plan: use the restructured skills on real work first, harvest observed violations, then build a small eval suite from them — per [Demystifying evals for AI agents](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents): tasks sourced from real failures (not invented), unambiguous pass/fail, outcome-graded (grep/script over the written tests where possible, calibrated LLM judge for the rest), baseline-vs-skill-loaded comparison. Lifecycle once built: capability testing until pass rates saturate, then it becomes a regression suite re-run only when a skill file is edited or a new violation shows up in real use (which becomes a new eval task).

## Open — to discuss before building

- Implementation-planner skill design: input spec format, how it sizes features, how it authors Done conditions. **Field notes from hand-authoring the first checklist: `docs/implementation-planner-notes.md`** — the two context sources (decided spec + codebase grounding pass), the grounding checks, decomposition rules, and the as-executed format (behavior section is `## Backend`, not "Behaviors").
- Which skills the implementation-planner names per checklist (`backend-tests`/`frontend-tests`, `backend-standards`, `data-fetching`, frontend equivalents), and whether the two-phase backend/frontend split maps to separate features or phases within one. **Settled in part:** checklists carry explicit skill directives (see Checklist → Skills above); test skills collapse to `backend-tests` + `frontend-tests` with the TDD loop merged into each; the build-order rule (backend → UI → integrate) belongs to the implementation-planner.
- Handoff template: exact headings, length cap.
- `/goal` wiring: whether `implement <checklist>` needs a thin skill wrapping the goal condition, or the checklist's Done section is passed verbatim.
- ~~Executor choice~~ **Settled:** the feature is built by the `backend-feature-builder` agent (frontmatter now preloads `backend-tests` + `backend-standards`), not the main session — preload is the only mechanism that guarantees the skills are in context. `/goal` supplies the completion gate around it.
- ~~Review pass~~ **Settled:** after the goal completes and the PR is open, the developer runs `review-backend-feature`, which forks the `backend-feature-reviewer` agent (same two skills preloaded — the checklists stay in the skills, the review skill restates nothing): an independent walk of both Review checklists against the PR's diff, fixes committed as one commit and pushed so the PR updates, per-item verdict returned for the transcript. Human-initiated, separate from `/goal`.
- ~~PR conventions~~ **Settled:** owned by the `open-feature-pr` skill (branch naming, Conventional-Commits title, What/Why/How/Verification body template, STE-derived language rules; sources: Google eng-practices CL descriptions, ASD-STE100 writing rules with the dictionary excluded). **Delivery is by preload**: `open-feature-pr` is in the `backend-feature-builder` agent's `skills:` frontmatter, and `build-backend-feature`'s final steps are "open the PR per the preloaded skill, return the URL" — the format is in the builder's context unconditionally, no doc-reading or checklist line required. The checklist's Done section ("PR URL shown in transcript") is the verification layer on top. The review pass then runs against the open PR.
