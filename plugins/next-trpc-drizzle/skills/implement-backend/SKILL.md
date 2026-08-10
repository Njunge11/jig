---
name: implement-backend
description: Use this skill to build the BACKEND of a feature test-first. This is Phase 1, before any frontend. The skill drives the feature's checklist + TDD loop to a green backend suite. tRPC + Drizzle + Vitest/PGlite.
context: fork
agent: backend-feature-builder
---

# Feature Build — Backend (Phase 1)

Build the backend of a feature test-first. The checklist drives the work. This skill runs in a forked subagent. The subagent has the `backend-tests` and `backend-standards` skills preloaded. Thus the checklist file and the repo are your source of truth. The subagent has no chat history. Write the checklist first, in the session, with backend-checklist.

**Checklist:** `$ARGUMENTS` — the path to the checklist file of the feature. If you did not get a path, find the file in the checklist location of the repo (`features/<name>/checklist.md`, or a tracker under `docs/`).

## The work

1. **Create the feature branch before any commit**: `git checkout -b <type>/<feature-slug>` off an up-to-date `main`. Use the branch names from the preloaded `open-feature-pr` skill. If the session is already on the branch of this feature, continue on that branch. Never commit feature work to `main` or an unrelated branch.
2. The `## Backend` section of the checklist is the task list. Work through it with [the loop](#the-loop) below.
3. When every `## Backend` item is `[x]`, **check the Review checklist of the preloaded `backend-standards` skill item by item against your diff** (`git diff main`). Name each item that the diff violates. Fix each violation. Keep the suite green. Commit the fixes as one commit.
4. When the suite is green after this check, **open the PR as the preloaded `open-feature-pr` skill specifies**. That skill owns the branch/title/body format and the `gh` steps. Do not make your own format.
5. **Return the proof**: show the checklist with all items `[x]`. State the result of the standards checklist (per item: pass or fixed). Paste the green `vitest --project backend` run. Show the PR URL. Then a watcher that sees only the transcript (e.g. `/goal`) can verify the work.

## The loop

The task list is immutable. You check items off. You never add, remove, or reword items.

Do these steps for each task, in order. A task can need several tests. Write them one at a time — never all up front. The first implementation decision invalidates the speculative remaining tests.

1. **Red.** Write one real, runnable test for the task. Run the test to see it fail. A test that passes before the implementation exists does not test the new behavior.
2. **Self-check.** Check the test against each item of the Review checklist of the preloaded `backend-tests` skill. Name each item that is true, fix the test, and check again. A test that fails the checklist breaks on refactors and proves nothing.
3. **Green.** Change the **code** until this test and all previous tests pass. Do nothing more. Do not refactor yet. Never make the tests pass by a change to a test. Do not edit assertions. Do not delete or skip tests. The only permitted test edit here is a fix to a test that contradicts the spec.
4. **Repeat** steps 1–3 until the task's tests cover the task.
5. **Refactor (optional).** Now improve the design, but only as far as this feature needs. Duplication alone is not a reason to extract. Tests stay green through this step.
6. **Commit.** One commit per task, when the task's tests pass. Never batch several tasks into one commit. The message follows the enforced convention of the repo. With commitlint present, that convention is Conventional Commits (`feat(scope): subject`). Message language: imperative, active voice, one idea per sentence, ≤20 words per sentence, simple tenses, no self-praise adjectives. State what changed, not how good it is. The git log becomes the step-by-step record of the feature. **Never bypass hooks** (`--no-verify` is banned). A failing pre-commit hook is part of the work. Diagnose and fix the hook failure. Hooks can auto-fix and re-stage files (Prettier/ESLint). That result is expected, not an error.
7. **Check the task off.** Then take the next task. The work is done when the list is empty.

While you work:

- A missing case discovered mid-task gets its test. The checklist stays unchanged.
- A change to the feature's scope goes in the deviations note of the handoff. Never include it silently.

## Rules

- **Stop at the backend.** Do not touch frontend/UI files — that's a separate phase and your review gate.
