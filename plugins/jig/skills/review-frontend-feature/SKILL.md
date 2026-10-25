---
name: review-frontend-feature
description: Use to review a feature's FRONTEND after it is built and before its branch is pushed — walks the frontend-standards Rules, the Verify list of every recipe that applies, and the frontend-tests Review checklist against the feature's diff, and reports a per-item verdict with the change that fixes each failure. It changes no file.
context: fork
agent: jig:frontend-feature-reviewer
background: false
---

# Feature Review — Frontend

An independent second walk of the frontend rubric against a feature's diff. This runs in a forked, read-only subagent with the `frontend-standards`, `frontend-tests` and `structure` skills preloaded. The frontend-standards `## Rules` list, the Verify list of every recipe that applies, the frontend-tests `## Review checklist`, the eve-agent and state-machines `## Review checklist` sections when the diff touches their files, and the structure tree are the rubric; this skill restates none of their rules. A `## Design facts` section in the feature's checklist joins the rubric. The review reports; it never edits, commits or pushes. The session that built the feature fixes each `fail` line.

**Scope:** `$ARGUMENTS` — the implementation checklist path (`docs/<project>/checklists/NN-<slug>.md` or `features/<name>/checklist.md`) and/or a branch. The diff under review is `git diff main` (or the given branch against main).

## The work

1. Read the feature's checklist and the full diff. Run `pnpm lint` in the app root and record its exit status: an item whose text ends with `Gate:` takes its verdict from that run, `pass` on exit `0`, else the report line.
2. **Name the recipes that apply, and load them.** Walk the frontend-standards catalog row by row against the changed surfaces, and record one verdict per row: `applies` with the files it covers, or `does not apply`. Decide from the diff, not from the recipes that the checklist or the builder named. Then invoke the recipe skill of every row that applies with the Skill tool. Do the same for `frontend-wiring` when the diff changes the tRPC client or server wiring, and for `frontend-authoring-custom` when it adds a custom compound component. **Gate:** every catalog row has a recorded verdict, and the transcript shows one Skill call per row that applies, before you go to step 3.
3. Walk the frontend-standards `## Rules` list **item by item against the changed files** — every rule, no skipping, no grep proxies: open the files and look. **Gate:** every rule has a recorded verdict before you go to step 4.
4. Walk **the Verify list of every recipe that applies** item by item against the surface it covers. **Gate:** every item has a recorded verdict before you go to step 5.
5. Walk the frontend-tests `## Review checklist` **item by item against every new or changed test**. **Gate:** every item has a recorded verdict before you go to step 6.
6. When the diff touches a client that imports `eve/react`, invoke the `eve-agent` skill with the Skill tool, walk its Review checklist **item by item**, and run its Gates. When it touches none, record `skipped — no eve client` and go on. **Gate:** every item has a recorded verdict, and the Gates' output is in the verdict, before you go to step 7.
7. When the diff touches a file that imports `xstate` or `@xstate/react`, invoke the `state-machines` skill with the Skill tool, walk the Shared and Frontend items of its Review checklist **item by item**, and run its Gates for Part A and Part C. When it touches none, record `skipped — no machine files` and go on. **Gate:** every item has a recorded verdict, and the Gates' output is in the verdict, before you go to step 8.
8. Walk the `structure` tree and its Placement rules over **every file the diff adds or moves**: is it in its defined place? **Gate:** every added or moved file has a recorded verdict before you go to step 9.
9. Walk the checklist's `## Design facts` section, when it has one, **item by item against the changed files** — open the files and check each `D<n>` statement. **Gate:** every fact has a recorded verdict before you go to step 10.
10. **Return the verdict** in the format below: one line per item of every rubric list — `pass`, `fail`, `browser-check`, or `developer-check`. A `fail` line names the file and line, the item it violates, and the change that fixes it — specific enough that the builder applies it without a second review. A transcript-only watcher (e.g. `/goal`) reads the walk from it. The workflow ends here.

### The `browser-check` verdict

Read the code first — it settles most rules. When only the rendered browser can prove a rule, record `browser-check` instead of guessing a `pass`.

### The `developer-check` verdict

When only an input the developer produces can prove an item — the `pnpm exec eve traces` of one real turn, for frontend-tests Review item 9 — record `developer-check` and name the input. The verdict line is complete with that; the developer's step is already in the checklist's `## Manual verification`. Never send the turn, and never hold the verdict open for it: a `/goal` check only sees the transcript, so an item that waits on a developer's paste never resolves and the run loops until the stop-hook cap ends it.

### Verdict format

```
frontend-standards Rules
 1 pass
 2 pass
 3 fail — features/invites/ui/member-picker.tsx:12 — imports Base UI; rebuild it on the kit's Popover + Command
 ... one line per rule, first to last

recipes
 recipe-page-with-data applies — features/invites/ui/invites-page.tsx
 recipe-data-table applies — features/invites/ui/columns.tsx
 recipe-search-and-filters does not apply
 ... one line per catalog row, first to last

recipe-data-table Verify
 1 pass
 2 fail — features/invites/ui/columns.tsx:30 — calls the v8 API; use the v9 call the recipe names
 ... one line per item, per recipe that applies

frontend-tests
 1 pass
 2 fail — features/invites/ui/__tests__/member-picker.test.tsx:41 — asserts the handler; assert the dialog the user sees
 ... one line per item, first to last

design-facts
 D1 pass
 D4 fail — features/invites/ui/day-row.tsx:18 — the toggle sits right of the day name; move it to the left
 D9 browser-check
 ... one line per fact, when the checklist has a ## Design facts section

state-machines
 4 fail — features/threads/ui/thread-view.tsx:30 — renders from a stage table; render from hasTag
 ... one line per Shared and Frontend item, first to last — or: skipped — no machine files
 gates <paste the typecheck and frontend test runs>

structure
 features/invites/ui/invites-page.tsx pass
 components/member-picker.tsx fail — move to features/invites/ui/member-picker.tsx

backend
 fail — features/invites/api/invites.router.ts — no procedure returns the inviter's name; add it to invites.list
 ... one line per backend defect, or: none
```

### When a step fails

- **No checklist path and no branch.** Return no verdict. Say that the review needs a checklist path or a branch.
- **`pnpm lint` or a Gate cannot run.** Record the command and its error on the item's line as `fail`, and go on with the walk.

## Rules

- **Change no file.** Bash runs read commands only: `git diff`, `git log`, `git status`, `pnpm lint`, and the Gates' commands. Never `git commit`, `git push`, `git checkout`, or a command that writes a file.
- **Only the rubric.** A `fail` line names what a rule or Verify item rejects, nothing else — no taste-based changes, no restructuring beyond what the violated item requires.
- **A test change is a fix only when the test itself violates a rule** (e.g. asserts implementation detail, pastes implementation output as the expectation). The fixed test must still cover the same behavior — never a fix that weakens or deletes a test.
- **The feature checklist is immutable**: never add, remove, reword, or re-check its items.
- **Stop at the frontend.** A backend defect you find goes in the verdict's `backend` block, one observable behavior per line. The builder writes it into the checklist's `## Backend` section and builds it.
