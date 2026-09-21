---
name: review-frontend-feature
description: Use to review a feature's FRONTEND after it is built and its PR is open — walks the frontend-standards Rules, every recipe's Verify list, and the frontend-tests Review checklist against the feature's diff, fixes violations in place, pushes so the PR updates, and reports a per-item verdict.
context: fork
agent: jig:frontend-feature-reviewer
---

# Feature Review — Frontend

An independent second walk of the frontend rubric against a feature's diff. This runs in a forked subagent with the `frontend-standards`, `frontend-tests`, `eve-agent`, `state-machines` and `structure` skills and every `recipe-*` skill preloaded — the frontend-standards `## Rules` list, the Verify list of every recipe, the frontend-tests, eve-agent and state-machines `## Review checklist` sections and the structure tree are the rubric; this skill restates none of their rules. A `## Design facts` section in the feature's checklist joins the rubric.

**Scope:** `$ARGUMENTS` — the implementation checklist path (`docs/<project>/checklists/NN-<slug>.md` or `features/<name>/checklist.md`) and/or a branch. The diff under review is `git diff main` (or the given branch against main).

## The work

1. Read the feature's checklist and the full diff. Run `pnpm lint` in the app root and record its exit status: an item whose text ends with `Gate:` takes its verdict from that run, `pass` on exit `0`, else the report line.
2. **Name the recipes that apply.** Every `recipe-*` skill is preloaded, so every recipe is already in your context — you load nothing. Walk the frontend-standards catalog row by row against the changed surfaces, and record one verdict per row: `applies` with the files it covers, or `does not apply`. Decide from the diff, not from the recipes that the checklist or the builder named. **Gate:** every catalog row has a recorded verdict before you go to step 3.
3. Walk the frontend-standards `## Rules` list **item by item against the changed files** — every rule, no skipping, no grep proxies: open the files and look. **Gate:** every rule has a recorded verdict before you go to step 4.
4. Walk **the Verify list of every recipe that applies** item by item against the surface it covers. **Gate:** every item has a recorded verdict before you go to step 5.
5. Walk the frontend-tests `## Review checklist` **item by item against every new or changed test**. **Gate:** every item has a recorded verdict before you go to step 6.
6. Walk the `eve-agent` Review checklist **item by item** when the diff touches a client that imports `eve/react`, and run its Gates. When it touches none, record `skipped — no eve client` and go on. **Gate:** every item has a recorded verdict, and the Gates' output is in the verdict, before you go to step 7.
7. Walk the `state-machines` Review checklist **item by item**, the Shared and Frontend items, when the diff touches a file that imports `xstate` or `@xstate/react`, and run its Gates for Part A and Part C. When it touches none, record `skipped — no machine files` and go on. **Gate:** every item has a recorded verdict, and the Gates' output is in the verdict, before you go to step 8.
8. Walk the `structure` tree and its Placement rules over **every file the diff adds or moves**: is it in its defined place? A file that is not moves now. **Gate:** every added or moved file has a recorded verdict before you go to step 9.
9. Walk the checklist's `## Design facts` section, when it has one, **item by item against the changed files** — open the files and check each `D<n>` statement. **Gate:** every fact has a recorded verdict before you go to step 10.
10. Fix every violation in place. **Gate:** the test files that cover each fixed file are green, run by name (`vitest run <file>`). A review that fixed nothing runs no test: the builder's full run stands. Never run the full suite here. The `state-machines` Gates pass again when step 7 ran. Commit all review fixes as **one commit**, message in the repo's enforced convention — with commitlint that's `refactor(<feature>): fix review-checklist violations`. Never bypass hooks (`--no-verify` is banned); a failing hook is work to fix. **Push the commit** so the open PR updates. **Gate:** `git status` shows the branch up to date with its remote.
11. **Return the verdict**: one line per item of every rubric list — `pass`, `fixed` with `file:line`, or `browser-check` — plus the test run of the fixed files when a fix was made, so a transcript-only watcher (e.g. `/goal`) can verify the walk happened. The workflow ends here.

### The `browser-check` verdict

Read the code first — it settles most rules. When only the rendered browser can prove a rule, record `browser-check` instead of guessing a `pass`.

### Verdict format

```
frontend-standards Rules
 1 pass
 2 pass
 3 fixed — features/invites/ui/member-picker.tsx:12 (Base UI import replaced with the kit's Popover + Command)
 ... one line per rule, first to last

recipes
 recipe-page-with-data applies — features/invites/ui/invites-page.tsx
 recipe-data-table applies — features/invites/ui/columns.tsx
 recipe-search-and-filters does not apply
 ... one line per catalog row, first to last

recipe-data-table Verify
 1 pass
 2 fixed — features/invites/ui/columns.tsx:30 (v8 API call replaced)
 ... one line per item, per recipe that applies

frontend-tests
 1 pass
 2 fixed — features/invites/ui/__tests__/member-picker.test.tsx:41 (asserts the dialog, not the handler)
 ... one line per item, first to last

design-facts
 D1 pass
 D4 fixed — features/invites/ui/day-row.tsx:18 (the toggle sits left of the day name)
 D9 browser-check
 ... one line per fact, when the checklist has a ## Design facts section

state-machines
 4 fixed — features/threads/ui/thread-view.tsx:30 (renders from hasTag, not a stage table)
 ... one line per Shared and Frontend item, first to last — or: skipped — no machine files
 gates <paste the typecheck and frontend test runs>

structure
 features/invites/ui/invites-page.tsx pass
 components/member-picker.tsx fixed — moved to features/invites/ui/member-picker.tsx
```

### When a step fails

- **A hook rejects the commit.** Fix what the hook reports, then commit again. Never pass `--no-verify`.
- **The push is rejected.** The remote branch moved. Run `git pull --rebase`, run the test files of the fixed files again, then push again.
- **A fix turns a test red.** The fix is wrong, not the test. Redo the fix so the test passes unchanged, unless the test itself violates a rule.

## Rules

- **Only the rubric.** Fix what a rule or Verify item rejects, nothing else — no taste-based refactors, no restructuring beyond what the violated item requires.
- **A test edit is legitimate only when the test itself violates a rule** (e.g. asserts implementation detail, pastes implementation output as the expectation). The fixed test must still cover the same behavior — never weaken or delete a test to get to green.
- **The feature checklist is immutable**: never add, remove, reword, or re-check its items.
- **Stop at the frontend.** Don't touch backend files. A backend defect you find is a finding in the report — write it as `## Backend` checklist items in the feature's checklist, one observable behavior per line, and when the project has a tracker (`docs/<project>/tracker.md`), append its row in the same edit (Status `Not started`, run command pointing at that checklist). Then continue the review; the main session dispatches the backend builder.
