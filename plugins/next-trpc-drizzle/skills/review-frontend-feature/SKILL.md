---
name: review-frontend-feature
description: Use to review a feature's FRONTEND after it is built and its PR is open — walks the frontend-standards Rules, the matching recipes' Verify lists, and the frontend-tests Review checklist against the feature's diff, fixes violations in place, pushes so the PR updates, and reports a per-item verdict.
context: fork
agent: frontend-feature-reviewer
---

# Feature Review — Frontend

An independent second walk of the frontend rubric against a feature's diff. This runs in a forked subagent with the `frontend-standards`, `frontend-tests`, and `structure` skills preloaded — the frontend-standards `## Rules` list, the matching recipes' Verify lists, and the frontend-tests `## Review checklist` are the rubric; this skill restates none of their rules.

**Scope:** `$ARGUMENTS` — the implementation checklist path (`docs/<project>/checklists/NN-<slug>.md` or `features/<name>/checklist.md`) and/or a branch. The diff under review is `git diff main` (or the given branch against main).

## The work

1. Read the feature's checklist and the full diff.
2. **Load the recipes.** Match the changed surfaces against the frontend-standards catalog and load every matching recipe file. Record which recipes you loaded — their Verify lists join the rubric.
3. Walk the frontend-standards `## Rules` list **item by item against the changed files** — every rule, no skipping, no grep proxies: open the files and look. **Gate:** every rule has a recorded verdict before you go to step 4.
4. Walk **each loaded recipe's Verify list** item by item against the surface it covers. **Gate:** every item has a recorded verdict before you go to step 5.
5. Walk the frontend-tests `## Review checklist` **item by item against every new or changed test**. **Gate:** every item has a recorded verdict before you go to step 6.
6. Walk the `structure` tree over **every file the diff adds or moves**: is it in its defined place? **Gate:** every added or moved file has a recorded verdict before you go to step 7.
7. Fix every violation in place. **Gate:** `vitest` is green after the fixes. Commit all review fixes as **one commit**, message in the repo's enforced convention — with commitlint that's `refactor(<feature>): fix review-checklist violations`. Never bypass hooks (`--no-verify` is banned); a failing hook is work to fix. **Push the commit** so the open PR updates. **Gate:** `git status` shows the branch up to date with its remote.
8. **Return the verdict**: one line per item of every rubric list — `pass`, `fixed` with `file:line`, or `browser-check` — plus the green `vitest` run, so a transcript-only watcher (e.g. `/goal`) can verify the walk happened. The workflow ends here.

### The `browser-check` verdict

Read the code first — it settles most rules. When only the rendered browser can prove a rule, record `browser-check` instead of guessing a `pass`.

### Verdict format

```
frontend-standards Rules
 1 pass
 2 pass
 3 fixed — features/invites/ui/member-picker.tsx:12 (Base UI import replaced with the kit's Popover + Command)
 ... one line per rule, first to last

data-table.md Verify
 1 pass
 2 fixed — features/invites/ui/columns.tsx:30 (v8 API call replaced)
 ... one line per item, per loaded recipe

frontend-tests
 1 pass
 2 fixed — features/invites/ui/__tests__/member-picker.test.tsx:41 (asserts the dialog, not the handler)
 ... one line per item, first to last

structure
 features/invites/ui/invites-page.tsx pass
 components/member-picker.tsx fixed — moved to features/invites/ui/member-picker.tsx
```

### When a step fails

- **A hook rejects the commit.** Fix what the hook reports, then commit again. Never pass `--no-verify`.
- **The push is rejected.** The remote branch moved. Run `git pull --rebase`, re-run `vitest`, then push again.
- **A fix turns the suite red.** The fix is wrong, not the test. Redo the fix so the test passes unchanged, unless the test itself violates a rule.

## Rules

- **Only the rubric.** Fix what a rule or Verify item rejects, nothing else — no taste-based refactors, no restructuring beyond what the violated item requires.
- **A test edit is legitimate only when the test itself violates a rule** (e.g. asserts implementation detail, pastes implementation output as the expectation). The fixed test must still cover the same behavior — never weaken or delete a test to get to green.
- **The feature checklist is immutable**: never add, remove, reword, or re-check its items.
- **Stop at the frontend.** Don't touch backend files. A backend defect you find is a finding in the report — write it as `## Backend` checklist items in the feature's checklist, one observable behavior per line, and when the project has a tracker (`docs/<project>/tracker.md`), append its row in the same edit (Status `Not started`, run command pointing at that checklist). Then continue the review; the main session dispatches the backend builder.
