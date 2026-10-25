---
name: review-backend-feature
description: Use to review a feature's BACKEND after it is built and before its branch is pushed — walks the backend-standards, backend-entry-points, backend-tests, eve-agent and state-machines Review checklists and the structure tree against the feature's diff, and reports a per-item verdict with the change that fixes each failure. It changes no file.
context: fork
agent: jig:backend-feature-reviewer
background: false
---

# Feature Review — Backend

An independent second walk of the backend Review checklists against a feature's diff. This runs in a forked, read-only subagent with the `backend-tests`, `backend-standards`, `backend-entry-points` and `structure` skills preloaded. Their `## Review checklist` sections and the structure tree are the rubric; this skill restates none of their rules. The review reports; it never edits, commits or pushes. The session that built the feature fixes each `fail` line.

**Scope:** `$ARGUMENTS` — the implementation checklist path (`docs/<project>/checklists/NN-<slug>.md`) and/or a branch. The diff under review is `git diff main` (or the given branch against main).

## The work

1. Read the feature's checklist and the full diff. Run `pnpm lint` in the app root and record its exit status: an item whose text ends with `Gate:` takes its verdict from that run, `pass` on exit `0`, else the report line.
2. Walk the `backend-standards` Review checklist **item by item against the changed files** — every item, no skipping, no grep proxies: open the files and look. **Gate:** every item has a recorded verdict before you go to step 3.
3. Walk the `backend-tests` Review checklist **item by item against every new or changed test**. **Gate:** every item has a recorded verdict before you go to step 4.
4. When the diff touches `agent/`, `evals/`, or a file that imports `eve/react`, invoke the `eve-agent` skill with the Skill tool, walk its Review checklist **item by item**, and run its Gates. When the diff touches none of them, record `skipped — no agent files` and go on. **Gate:** every item has a recorded verdict, and the Gates' output is in the verdict, before you go to step 5.
5. When the diff touches a file that imports `xstate` or a file under a `machine/` folder, invoke the `state-machines` skill with the Skill tool, walk the Shared and Backend items of its Review checklist **item by item**, and run its Gates for Part A and Part B. When it touches none, record `skipped — no machine files` and go on. **Gate:** every item has a recorded verdict, and the Gates' output is in the verdict, before you go to step 6.
6. Walk the `structure` tree and its Placement rules over **every file the diff adds or moves**: is it in its defined place? **Gate:** every added or moved file has a recorded verdict before you go to step 7.
7. **Return the verdict** in the format below: one line per checklist item and one line per added or moved file. A `fail` line names the file and line, the item it violates, and the change that fixes it — specific enough that the builder applies it without a second review. A transcript-only watcher (e.g. `/goal`) reads the walk from it. The workflow ends here.

### Verdict format

```
backend-standards
 1 pass
 2 pass
 3 fail — src/features/invites/api/invites.router.ts:41 — the router runs a query; move it into invites.service.ts
 ... one line per item, first to last

backend-tests
 1 fail — src/features/invites/invites.service.test.ts:88 — asserts the repo call; assert the returned invite
 2 pass
 ... one line per item, first to last

eve-agent
 1 pass
 3 fail — agent/tools/get_order.ts:40 — no toModelOutput; add one that returns the order's number and status
 ... one line per item, first to last — or: skipped — no agent files
 gates <paste `pnpm exec eve info`; no eval script and no real turn run, the developer runs them>

state-machines
 4 fail — features/threads/api/thread.machine.ts:12 — the buttons sit in a table; move them into the state's meta
 ... one line per Shared and Backend item, first to last — or: skipped — no machine files
 gates <paste the typecheck and backend test runs>

structure
 features/invites/api/invites.service.ts pass
 agent/lib/checkout.states.ts fail — move to features/checkout/machine/checkout.states.ts
```

### When a step fails

- **No checklist path and no branch.** Return no verdict. Say that the review needs a checklist path or a branch.
- **`pnpm lint` or a Gate cannot run.** Record the command and its error on the item's line as `fail`, and go on with the walk.

## Rules

- **Change no file.** Bash runs read commands only: `git diff`, `git log`, `git status`, `pnpm lint`, and the Gates' commands. Never `git commit`, `git push`, `git checkout`, or a command that writes a file.
- **Only the checklists.** A `fail` line names what an item rejects, nothing else — no taste-based changes, no restructuring beyond what the violated item requires.
- **A test change is a fix only when the test itself violates an item** (e.g. asserts an internal call, pastes implementation output). The fixed test must still cover the same behavior — never a fix that weakens or deletes a test.
- **The feature checklist is immutable**: never add, remove, reword, or re-check its items.
- **Stop at the backend.** Review no frontend/UI file.
