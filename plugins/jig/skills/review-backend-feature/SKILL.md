---
name: review-backend-feature
description: Use to review a feature's BACKEND after it is built and its PR is open — walks the backend-standards, backend-tests, eve-agent and state-machines Review checklists and the structure tree against the feature's diff, fixes violations in place, pushes so the PR updates, and reports a per-item verdict.
context: fork
agent: jig:backend-feature-reviewer
---

# Feature Review — Backend

An independent second walk of the backend Review checklists against a feature's diff. This runs in a forked subagent with the `backend-tests`, `backend-standards`, `eve-agent`, `state-machines` and `structure` skills preloaded — their `## Review checklist` sections and the structure tree are the rubric; this skill restates none of their rules.

**Scope:** `$ARGUMENTS` — the implementation checklist path (`docs/<project>/checklists/NN-<slug>.md`) and/or a branch. The diff under review is `git diff main` (or the given branch against main).

## The work

1. Read the feature's checklist and the full diff. Run `pnpm lint` in the app root and record its exit status: an item whose text ends with `Gate:` takes its verdict from that run, `pass` on exit `0`, else the report line.
2. Walk the `backend-standards` Review checklist **item by item against the changed files** — every item, no skipping, no grep proxies: open the files and look. **Gate:** every item has a recorded verdict before you go to step 3.
3. Walk the `backend-tests` Review checklist **item by item against every new or changed test**. **Gate:** every item has a recorded verdict before you go to step 4.
4. Walk the `eve-agent` Review checklist **item by item** when the diff touches `agent/`, `evals/`, or a file that imports `eve/react`, and run its Gates. When the diff touches none of them, record `skipped — no agent files` and go on. **Gate:** every item has a recorded verdict, and the Gates' output is in the verdict, before you go to step 5.
5. Walk the `state-machines` Review checklist **item by item**, the Shared and Backend items, when the diff touches a file that imports `xstate`, and run its Gates for Part A and Part B. When it touches none, record `skipped — no machine files` and go on. **Gate:** every item has a recorded verdict, and the Gates' output is in the verdict, before you go to step 6.
6. Walk the `structure` tree and its Placement rules over **every file the diff adds or moves**: is it in its defined place? A file that is not moves now. **Gate:** every added or moved file has a recorded verdict before you go to step 7.
7. Fix every violation in place. **Gate:** `vitest --project backend` is green after the fixes, and the `eve-agent` Gates pass again when step 4 ran, and the `state-machines` Gates when step 5 ran. Commit all review fixes as **one commit**, message in the repo's enforced convention — with commitlint that's `refactor(<feature>): fix review-checklist violations`. Never bypass hooks (`--no-verify` is banned); a failing hook is work to fix. **Push the commit** so the open PR updates. **Gate:** `git status` shows the branch up to date with its remote.
8. **Return the verdict**: one line per checklist item — `pass`, or `fixed` with `file:line` and the item number — and one line per added or moved file, plus the green `vitest --project backend` run, so a transcript-only watcher (e.g. `/goal`) can verify the walk happened. The workflow ends here.

### Verdict format

```
backend-standards
 1 pass
 2 pass
 3 fixed — src/features/invites/api/invites.router.ts:41 (query moved into the service)
 ... one line per item, first to last

backend-tests
 1 fixed — src/features/invites/invites.service.test.ts:88 (asserts the returned invite, not the repo call)
 2 pass
 ... one line per item, first to last

eve-agent
 1 pass
 3 fixed — agent/tools/get_job.ts:40 (toModelOutput added)
 ... one line per item, first to last — or: skipped — no agent files
 gates <paste `pnpm exec eve info` and the eval script's run>

state-machines
 4 fixed — features/threads/api/thread.machine.ts:12 (the buttons moved from a table into meta)
 ... one line per Shared and Backend item, first to last — or: skipped — no machine files
 gates <paste the typecheck and backend test runs>

structure
 features/invites/api/invites.service.ts pass
 agent/lib/posting.states.ts fixed — moved to features/job-posting/machine/job-posting.states.ts
```

### When a step fails

- **A hook rejects the commit.** Fix what the hook reports, then commit again. Never pass `--no-verify`.
- **The push is rejected.** The remote branch moved. Run `git pull --rebase`, re-run `vitest --project backend`, then push again.
- **A fix turns the suite red.** The fix is wrong, not the test. Redo the fix so the test passes unchanged, unless the test itself violates a `backend-tests` item.

## Rules

- **Only the checklists.** Fix what an item rejects, nothing else — no taste-based refactors, no restructuring beyond what the violated item requires.
- **A test edit is legitimate only when the test itself violates an item** (e.g. asserts an internal call, pastes implementation output). The fixed test must still cover the same behavior — never weaken or delete a test to get to green.
- **The feature checklist is immutable**: never add, remove, reword, or re-check its items.
- **Stop at the backend.** Don't touch frontend/UI files.
