---
name: review-backend-feature
description: Use to review a feature's BACKEND after it is built and its PR is open — walks the backend-standards and backend-tests Review checklists against the feature's diff, fixes violations in place, pushes so the PR updates, and reports a per-item verdict.
context: fork
agent: backend-feature-reviewer
---

# Feature Review — Backend

An independent second walk of the backend Review checklists against a feature's diff. This runs in a forked subagent with the `backend-tests` and `backend-standards` skills preloaded — their `## Review checklist` sections are the rubric; this skill restates none of their rules.

**Scope:** `$ARGUMENTS` — the feature's `features/<name>/checklist.md` path and/or a branch. The diff under review is `git diff main` (or the given branch against main).

## The work

1. Read the feature's checklist and the full diff.
2. Walk the `backend-standards` Review checklist **item by item against the changed files** — every item, no skipping, no grep proxies: open the files and look.
3. Walk the `backend-tests` Review checklist **item by item against every new or changed test**.
4. Fix every violation in place. `vitest --project backend` must be green after the fixes. Commit all review fixes as **one commit**, message in the repo's enforced convention — with commitlint that's `refactor(<feature>): fix review-checklist violations`. Never bypass hooks (`--no-verify` is banned); a failing hook is work to fix. **Push the commit** so the open PR updates.
5. **Return the verdict**: one line per checklist item — `pass`, or `fixed` with `file:line` and the item number — plus the green `vitest --project backend` run, so a transcript-only watcher (e.g. `/goal`) can verify the walk happened.

## Rules

- **Only the checklists.** Fix what an item rejects, nothing else — no taste-based refactors, no restructuring beyond what the violated item requires.
- **A test edit is legitimate only when the test itself violates an item** (e.g. asserts an internal call, pastes implementation output). The fixed test must still cover the same behavior — never weaken or delete a test to get to green.
- **The feature checklist is immutable**: never add, remove, reword, or re-check its items.
- **Stop at the backend.** Don't touch frontend/UI files.
