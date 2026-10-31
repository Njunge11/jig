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

1. Read the feature's checklist and the full diff. Run `pnpm lint` in the app root and record its exit status: an item whose text ends with `Gate:` takes its verdict from that run, `pass` on exit `0`, else the report line. The diff is your read: open a file only for the lines a rule needs around a hunk, with Read on that range, never the whole file. Run no test and no typecheck: the builder's gates and the push run them, and a review that runs them again proves nothing new.
2. Walk the `backend-standards` Review checklist **item by item against the changed files** — every item, no skipping, no grep proxies: open the files and look. **Gate:** every item has a recorded verdict before you go to step 3.
3. Walk the `backend-tests` Review checklist **item by item against every new or changed test**. **Gate:** every item has a recorded verdict before you go to step 4.
4. When the diff touches `agent/`, `evals/`, or a file that imports `eve/react`, invoke the `eve-agent` skill with the Skill tool, and walk its Review checklist **item by item**. When the diff touches none of them, record `skipped — no agent files` and go on. **Gate:** every item has a recorded verdict before you go to step 5.
5. When the diff touches a file that imports `xstate` or a file under a `machine/` folder, invoke the `state-machines` skill with the Skill tool, and walk the Shared and Backend items of its Review checklist **item by item**. When it touches none, record `skipped — no machine files` and go on. **Gate:** every item has a recorded verdict before you go to step 6.
6. Walk the `structure` tree and its Placement rules over **every file the diff adds or moves**: is it in its defined place? **Gate:** every added or moved file has a recorded verdict before you go to step 7.
7. **Return the verdict** in the format below. A `pass` is silent. Each rubric list returns one count line, `<list> <n> walked, <m> fail`, and then one line per `fail`, `browser-check` or `developer-check` item. A `fail` line names the file and line, the item it violates, and the change that fixes it — specific enough that the builder applies it without a second review. The count line is the proof that the walk happened; a transcript-only watcher (e.g. `/goal`) reads it. Every line the verdict does not need is thinking the review did not need. The workflow ends here.

### Verdict format

```
backend-standards 38 walked, 1 fail
 3 fail — src/features/invites/api/invites.router.ts:41 — the router runs a query; move it into invites.service.ts

backend-tests 15 walked, 1 fail
 1 fail — src/features/invites/invites.service.test.ts:88 — asserts the repo call; assert the returned invite

eve-agent 12 walked, 1 fail
 3 fail — agent/tools/get_order.ts:40 — no toModelOutput; add one that returns the order's number and status

state-machines skipped — no machine files

structure 6 files, 1 fail
 agent/lib/checkout.states.ts fail — move to features/checkout/machine/checkout.states.ts
```

### When a step fails

- **No checklist path and no branch.** Return no verdict. Say that the review needs a checklist path or a branch.
- **`pnpm lint` cannot run.** Record the command and its error on the item's line as `fail`, and go on with the walk.

## Rules

- **Change no file.** Bash runs read commands only: `git diff`, `git log`, `git status`, and `pnpm lint`; never a test run or a typecheck. Never `git commit`, `git push`, `git checkout`, or a command that writes a file.
- **Only the checklists.** A `fail` line names what an item rejects, nothing else — no taste-based changes, no restructuring beyond what the violated item requires.
- **A test change is a fix only when the test itself violates an item** (e.g. asserts an internal call, pastes implementation output). The fixed test must still cover the same behavior — never a fix that weakens or deletes a test.
- **The feature checklist is immutable**: never add, remove, reword, or re-check its items.
- **Stop at the backend.** Review no frontend/UI file.
