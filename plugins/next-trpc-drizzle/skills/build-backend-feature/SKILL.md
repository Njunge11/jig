---
name: build-backend-feature
description: Use this skill to build the BACKEND of a feature test-first. This is Phase 1, before any frontend. The skill drives the feature's checklist + TDD loop to a green backend suite. tRPC + Drizzle + Vitest/PGlite.
context: fork
agent: backend-feature-builder
---

# Feature Build — Backend (Phase 1)

Build the backend of a feature test-first. The checklist drives the work. This skill runs in a forked subagent. The subagent has the `backend-tests` and `backend-standards` skills preloaded. Thus the checklist file and the repo are your source of truth. The subagent has no chat history. Write the checklist first, in the session, with backend-checklist.

**Checklist:** `$ARGUMENTS` — the path to the checklist file of the feature. If you did not get a path, find the file in the checklist location of the repo (`features/<name>/checklist.md`, or a tracker under `docs/`).

## The work

1. **Create the feature branch before any commit**: `git checkout -b <type>/<feature-slug>` off an up-to-date `main`. Use the branch names from the preloaded `open-feature-pr` skill. If the session is already on the branch of this feature, continue on that branch. Never commit feature work to `main` or an unrelated branch.
2. The `## Backend` section of the checklist is the test list. Work through the list with **the loop from the preloaded `backend-tests` skill**. That skill owns the loop (red → self-check → green → refactor → commit per behavior). Do not make your own version of the loop here.
3. When every `## Backend` item is `[x]`, **check the Review checklist of the preloaded `backend-standards` skill item by item against your diff** (`git diff main`). Name each item that the diff violates. Fix each violation. Keep the suite green. Commit the fixes as one commit.
4. When the suite is green after this check, **open the PR as the preloaded `open-feature-pr` skill specifies**. That skill owns the branch/title/body format and the `gh` steps. Do not make your own format.
5. **Return the proof**: show the checklist with all items `[x]`. State the result of the standards checklist (per item: pass or fixed). Paste the green `vitest --project backend` run. Show the PR URL. Then a watcher that sees only the transcript (e.g. `/goal`) can verify the work.

## Rules

- **Stop at the backend.** Do not touch frontend/UI files — that's a separate phase and your review gate.
