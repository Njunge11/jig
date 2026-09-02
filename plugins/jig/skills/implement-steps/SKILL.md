---
name: implement-steps
description: Use this skill to execute a STEP implementation checklist — work that only changes the code's structure, not what the software does. The skill drives the checklist's steps to green standing checks at baseline counts and an open PR. Backend and frontend step checklists both run here; the checklist's Domain picks the rubric.
context: fork
agent: jig:step-builder
---

# Implement Steps

Execute a step implementation checklist. The checklist drives the work — the implementation planner writes it before this skill runs.

**Checklist:** `$ARGUMENTS` — the path to the implementation checklist (`docs/<project>/checklists/NN-<slug>.md`). If you did not get a path, find it in the tracker (`docs/<project>/tracker.md`).

**The governing rubric:** the checklist's `## Scope` names its Domain. `Domain: backend` → the preloaded `backend-standards` skill; `Domain: frontend` → the preloaded `frontend-standards` skill's `## Rules`. A checklist with no Domain line is backend. The domain also picks the review skill at step 7.

## The work

1. **Create the branch before any commit.** The checklist's `## Scope` section names it (`<type>/<slug>`). Create it off an up-to-date `main`. If the session is already on that branch, continue on it. Never commit to `main` or an unrelated branch. **Gate:** `git branch --show-current` prints the checklist's branch.
2. **Record the baseline.** Run the standing checks (the `test`/`test:run` and `typecheck` scripts) of the affected packages on the fresh branch. Record each command, its final summary counts, and its exit status. The `## Done` items compare against these counts. **Gate:** the baseline runs and their counts are in the transcript.
3. **Execute the `## Steps` section in order**, one step at a time. Each step is a mechanical rule — do exactly what it names, nothing more. The step list is immutable: never add, remove, or reword a step. The rules of the governing rubric govern every edit. Commit each step that changes files as one commit, message under the **Language rules** of the preloaded `open-feature-pr` skill. **Never bypass hooks** (`--no-verify` is banned); a failing hook is part of the work. **Gate:** every step is executed, in order.
4. **Walk the governing rubric item by item against your diff** (`git diff main`) — backend: the `backend-standards` Review checklist; frontend: the `frontend-standards` `## Rules`. Name each item that the diff violates. Fix each violation. Commit the fixes as one commit. **Gate:** every item has a recorded verdict, and the standing checks are green at the baseline counts.
5. **Prove the `## Done` items.** For each item except the PR item: run its command, paste the command with its final summary output and its exit status, and tick the box. Then set this checklist's Status to `Done` in `docs/<project>/tracker.md`. Commit the checklist and the tracker. **Gate:** every non-PR box is `[x]`, with its proof in the transcript.
6. **Open the PR as the preloaded `open-feature-pr` skill specifies.** That skill owns the branch, title, and body format, and the `gh` steps. Then tick the PR box with the URL, commit, and push so the PR updates. **Gate:** `gh` returns the PR URL, and every `## Done` box is `[x]`.
7. **Invoke the domain's review skill** — backend: `review-backend-feature`; frontend: `review-frontend-feature` — with the checklist path and the branch as its arguments. It runs the independent review in its own forked subagent, which has no access to this session — that separation is what keeps the review independent. Never walk its checklists yourself. A diff with no test changes passes the test-skill items trivially; that is expected. **Gate:** the invocation returns the per-item verdict and a green suite run.
8. **Return the proof** in the format under [Proof format](#proof-format) below. Then a watcher that sees only the transcript (e.g. `/goal`) can verify the work. The workflow ends here.

### Proof format

```
checklist docs/growth/checklists/07-extract-email-package.md
 steps 1–N executed in order, one line per step

<governing rubric — backend-standards, or frontend-standards Rules>
 1 pass
 2 fixed — packages/email/src/send.ts:12 (row type derived from the schema)
 ... one line per item, first to last

done
 [x] pnpm --filter @repo/email test:run — 41 passed, EXIT=0 (baseline 41)
 ... one line per Done item, first to last

tracker  docs/growth/tracker.md — 07 Status: Done
PR       https://github.com/<org>/<repo>/pull/<n>
review   <paste the verdict the domain's review run returned: one line per item, plus its suite run>
```

## When a step fails

- **The checklist path does not exist.** Do not guess a path. Open `docs/<project>/tracker.md` and take the path from the row of this checklist. If the tracker has no such row, stop and report the missing file.
- **The branch already exists.** Run `git branch --show-current`. If it is that branch, continue on it. If it is not, run `git checkout <branch>` and continue.
- **A baseline check is red on the fresh branch.** The failure exists on `main` and is not yours to fix here. Stop and report the red check with its output.
- **A standing check goes red after an edit.** The edit changed behavior. Fix the code until the check is green at the baseline counts. Never edit a test to get to green — a step lane changes structure only. The one exception: a test that names a moved path or import; update that reference, keep the assertions unchanged.
- **A step conflicts with a rule of the governing rubric.** Stop and report the conflict. Never execute the step, and never reword it.
- **A pre-commit hook rejects the commit.** Fix what the hook reports, then commit again. Never pass `--no-verify`.
- **`git push` or `gh` fails at step 6.** Use the **When a step fails** section of the preloaded `open-feature-pr` skill. Do not open the PR by another route.
- **The review invocation at step 7 fails.** Retry it once. If it fails again, state the failure in the proof's `review` line and stop. Never substitute your own walk of the review checklists — that breaks the review's independence.
