---
name: implement-backend
description: Use this skill to build the BACKEND of a feature test-first, before any frontend work. The skill drives the feature's checklist + TDD loop to a green backend suite. tRPC + Drizzle + Vitest/PGlite.
context: fork
agent: backend-feature-builder
---

# Implement Backend

Build the backend of a feature test-first. The checklist drives the work — the implementation planner writes it before this skill runs.

**Checklist:** `$ARGUMENTS` — the path to the implementation checklist (`docs/<project>/checklists/NN-<slug>.md`). If you did not get a path, find it in the tracker (`docs/<project>/tracker.md`).

## The work

1. **Create the feature branch before any commit**: `git checkout -b <type>/<feature-slug>` off an up-to-date `main`. Use the branch names from the preloaded `open-feature-pr` skill. If the session is already on the branch of this feature, continue on that branch. Never commit feature work to `main` or an unrelated branch. **Gate:** `git branch --show-current` prints the feature branch, not `main`.
2. The `## Backend` section of the checklist is the task list. Work through it with [the loop](#the-loop) below. **Gate:** every `## Backend` item is `[x]` and `vitest --project backend` is green.
3. **Check the Review checklist of the preloaded `backend-standards` skill item by item against your diff** (`git diff main`). Name each item that the diff violates. Fix each violation. Commit the fixes as one commit. **Gate:** every item has a recorded verdict and `vitest --project backend` is green.
4. **Write the handoff and flip the tracker.** Write `docs/<project>/handoffs/NN-<slug>.md` — the `handoffs/` folder sits beside the checklist's folder. Use the [handoff format](#handoff-format) below. Then set this checklist's Status to `Done` in `docs/<project>/tracker.md`. **Gate:** both files exist on the branch and are committed.
5. **Open the PR as the preloaded `open-feature-pr` skill specifies.** That skill owns the branch, title, and body format, and the `gh` steps. Do not make your own format. **Gate:** `gh` returns the PR URL.
6. **Invoke the `review-backend-feature` skill** with the checklist path and the branch as its arguments. It runs the independent review in its own forked subagent, which has no access to this session — that separation is what keeps the review independent. Never walk its checklists yourself. **Gate:** the invocation returns the per-item verdict and a green suite run.
7. **Return the proof** in the format under [Proof format](#proof-format) below. Then a watcher that sees only the transcript (e.g. `/goal`) can verify the work. The workflow ends here.

### Handoff format

```markdown
# NN — <checklist name>

## What shipped

- <one line per `## Backend` task, in checklist order>

## Deviations

- <every change to the feature's scope, and why — or "None.">

## Follow-ups

- <what the next checklist needs from this one — or "None.">
```

### Proof format

```
checklist docs/growth/checklists/03-invitations-schema.md
 [x] repo.create stores the invitation with a hashed token
 [x] repo.revoke marks the invitation revoked
 ... one line per Backend item, first to last

backend-standards
 1 pass
 2 fixed — src/features/invites/api/invites.router.ts:41 (query moved into the service)
 ... one line per item, first to last

handoff  docs/growth/handoffs/03-invitations-schema.md
tracker  docs/growth/tracker.md — 03 Status: Done
suite    <paste the full green `vitest --project backend` run>
PR       https://github.com/<org>/<repo>/pull/<n>
review   <paste the verdict the review-backend-feature run returned: one line per item, plus its suite run>
```

## The loop

The task list is immutable. You check items off. You never add, remove, or reword items.

Do these steps for each task, in order. A task can need several tests. Write them one at a time — never all up front. The first implementation decision invalidates the speculative remaining tests.

1. **Red.** Write one real, runnable test for the task. Run the test to see it fail. A test that passes before the implementation exists does not test the new behavior.
2. **Self-check.** Check the test against each item of the Review checklist of the preloaded `backend-tests` skill. Name each item that is true, fix the test, and check again. A test that fails the checklist breaks on refactors and proves nothing.
3. **Green.** Change the **code** until this test and all previous tests pass. Do nothing more. Do not refactor yet. A red test is fixed in the code, never in the test: do not weaken an assertion, change an expected value to match the output, or delete or skip a test to get to green. The one exception: a test that contradicts the spec — fix that test to say what the spec says.
4. **Repeat** steps 1–3 until the task's tests cover the task.
5. **Refactor (optional).** Now improve the design, but only as far as this feature needs. Duplication alone is not a reason to extract. Tests stay green through this step.
6. **Commit.** One commit per task, when the task's tests pass. Never batch several tasks into one commit. The message follows the enforced convention of the repo. With commitlint present, that convention is Conventional Commits (`feat(scope): subject`). Write the message under the **Language rules** of the preloaded `open-feature-pr` skill. The git log becomes the step-by-step record of the feature. **Never bypass hooks** (`--no-verify` is banned). A failing pre-commit hook is part of the work. Diagnose and fix the hook failure. Hooks can auto-fix and re-stage files (Prettier/ESLint). That result is expected, not an error.
7. **Check the task off.** Then take the next task. The work is done when the list is empty.

While you work:

- A missing case discovered mid-task gets its test. The checklist stays unchanged.
- A change to the feature's scope goes in the **Deviations** section of the handoff you write in step 4. Never make it silently.

## When a step fails

- **The checklist path does not exist.** Do not guess a path. Open `docs/<project>/tracker.md` and take the path from the row of this checklist. If the tracker has no such row, stop and report the missing file.
- **`git checkout -b` reports that the branch exists.** Run `git branch --show-current`. If it is that branch, continue on it. If it is not, run `git checkout <branch>` and continue.
- **A new test passes before you write the implementation.** The test does not test the new behavior. Rewrite the test to assert the behavior the task states. Never continue from a green Red step.
- **A task will not go green.** Fix the code, never the test. The only permitted test edit is a fix to a test that contradicts the spec. If the spec and the checklist conflict, stop and report the conflict.
- **A pre-commit hook rejects the commit.** Fix what the hook reports, then commit again. Never pass `--no-verify`.
- **A `## Backend` item is wrong or missing a case.** The task list is immutable. Write the extra test under the current task. Record the difference in the handoff's **Deviations** section.
- **`git push` or `gh` fails at step 5.** Use the **When a step fails** section of the preloaded `open-feature-pr` skill. Do not open the PR by another route.
- **The `review-backend-feature` invocation at step 6 fails.** Retry it once. If it fails again, state the failure in the proof's `review` line and stop. Never substitute your own walk of the review checklists — that breaks the review's independence.
