---
name: build-backend-feature
description: Use to build the BACKEND of a feature test-first — Phase 1, before any frontend. Drives a feature's checklist + TDD loop to a green backend suite. tRPC + Drizzle + Vitest/PGlite.
context: fork
agent: backend-feature-builder
---

# Feature Build — Backend (Phase 1)

Build a feature's backend test-first, driven by its checklist. This runs in a forked subagent with the `backend-tests` and `backend-standards` skills preloaded — so the checklist file and the repo are your source of truth (no chat history). Author the checklist first, in-session, with backend-checklist.

**Checklist:** `$ARGUMENTS` — the path to the feature's `features/<name>/checklist.md`. If none was given, locate the feature's checklist under `features/`.

## The work

1. The `## Backend` section of the checklist is the test list. Burn it down with **the loop from the preloaded `backend-tests` skill** — that skill owns the loop (red → self-check → green → refactor → commit per behavior); do not improvise a variant of it here.
2. When every `## Backend` item is `[x]`, **walk the Review checklist of the preloaded `backend-standards` skill item by item against your diff** (`git diff main`). Name each violated item, fix it, keep the suite green; commit the fixes as one commit.
3. When the suite is green after the walk, **open the PR per the preloaded `open-feature-pr` skill** — that skill owns the branch/title/body format and the `gh` steps; do not improvise a format.
4. **Return the proof**: show the checklist with all items `[x]`, state the standards-checklist walk result (per item: pass or fixed), paste the green `vitest --project backend` run, and show the PR URL, so a transcript-only watcher (e.g. `/goal`) can verify it.

## Rules

- **Stop at the backend.** Don't touch frontend/UI files — that's a separate phase and your review gate.
