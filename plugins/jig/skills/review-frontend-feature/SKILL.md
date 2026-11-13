---
name: review-frontend-feature
description: Use to review a feature's FRONTEND after it is built and before its branch is pushed — walks the frontend-standards Rules, the Verify list of every recipe that applies, and the e2e-tests Review checklist against the feature's diff, checks that each end-to-end test the checklist lists exists, gives a second verdict on each built screen against its design source, and reports a per-item verdict with the change that fixes each failure. It changes no file.
context: fork
agent: jig:frontend-feature-reviewer
background: false
---

# Feature Review — Frontend

An independent second walk of the frontend rubric against a feature's diff. This runs in a forked, read-only subagent with the `frontend-standards`, `e2e-tests` and `structure` skills preloaded. The frontend-standards `## Rules` list, the Verify list of every recipe that applies, the e2e-tests `## Review checklist` and **The design check**, the eve-agent and state-machines `## Review checklist` sections when the diff touches their files, and the structure tree are the rubric; this skill restates none of their rules. The `## E2E tests` and `## Designs` sections of the feature's checklist join the rubric. The review reports; it never edits, commits or pushes. The session that built the feature fixes each `fail` line.

**Scope:** `$ARGUMENTS` — the implementation checklist path (`docs/<project>/checklists/NN-<slug>.md` or `features/<name>/checklist.md`) and/or a branch. The diff under review is `git diff main` (or the given branch against main).

## The work

1. Read the feature's checklist and the full diff. Run `pnpm lint` in the app root and record its exit status: an item whose text ends with `Gate:` takes its verdict from that run, `pass` on exit `0`, else the report line. The diff is your read: open a file only for the lines a rule needs around a hunk, with Read on that range, never the whole file. Run no test and no typecheck: the builder's gates and the push run them, and a review that runs them again proves nothing new. A component test (a `*.test.tsx` file, jsdom, a mocked network) that the diff adds is a `fail` line: the standard has no such layer (`e2e-tests`, **The two layers**).
2. **Name the recipes that apply, and load them.** Walk the frontend-standards catalog row by row against the changed surfaces, and record one verdict per row: `applies` with the files it covers, or `does not apply`. Decide from the diff, not from the recipes that the checklist or the builder named. Then invoke the recipe skill of every row that applies with the Skill tool. Do the same for `frontend-wiring` when the diff changes the tRPC client or server wiring, and for `frontend-authoring-custom` when it adds a custom compound component. **Gate:** every catalog row has a recorded verdict, and the transcript shows one Skill call per row that applies, before you go to step 3.
3. Walk the frontend-standards `## Rules` list **item by item against the changed files** — every rule, no skipping, no grep proxies: open the files and look. **Gate:** every rule has a recorded verdict before you go to step 4.
4. Walk **the Verify list of every recipe that applies** item by item against the surface it covers. **Gate:** every item has a recorded verdict before you go to step 5.
5. Walk the e2e-tests `## Review checklist` **item by item against every new or changed end-to-end test**. Then check the list: each `E<n>` line of the checklist's `## E2E tests` section has one test, or one `test.step`, whose name states that line, and whose expected values are the values of the spec. A line with no test is a `fail` line that names the line and the flow file to add it to. A test that is skipped (`test.skip`, `test.fixme`) or that asserts less than its line states is a `fail` line. Then read the spec section that the checklist's Scope names, for the flow of this slice: a failure path the spec states, or an edge case a person can cause, that has no `E<n>` line is a `fail` line that names the case. **Gate:** every item and every `E<n>` line has a recorded verdict before you go to step 6.
6. When the diff touches a client that imports `eve/react`, invoke the `eve-agent` skill with the Skill tool, and walk its Review checklist **item by item**. When it touches none, record `skipped — no eve client` and go on. **Gate:** every item has a recorded verdict before you go to step 7.
7. When the diff touches a file that imports `xstate` or `@xstate/react`, invoke the `state-machines` skill with the Skill tool, and walk the Shared and Frontend items of its Review checklist **item by item**. When it touches none, record `skipped — no machine files` and go on. **Gate:** every item has a recorded verdict before you go to step 8.
8. Walk the `structure` tree and its Placement rules over **every file the diff adds or moves**: is it in its defined place? **Gate:** every added or moved file has a recorded verdict before you go to step 9.
9. Give the design verdict, **design by design**, for each `D<n>` line of the checklist's `## Designs` section (in a checklist written before this standard: each group of its `## Design facts` section that names a design). The builder's run left three files per design in the e2e package, under `.output/screens/<app>/`: `<Design>-<width>.png` (the built screen), `<Design>-<width>-design.png` (the design source as the browser draws it) and `<Design>-<width>.design.json` (the comparison). Your verdict is your own, never the builder's: (a) read the `.design.json`: each entry of `differences` is a `fail` line with the text, the value of the design and the built value, and each text of `onlyInDesign` that is not sample data is a part that is not built, a `fail` line. (b) Open the two screenshots with the Read tool in one step, and judge the five things the run does not compare: the shape of each icon, the space between the blocks, the width of each table column, the layers of each shadow and gradient, and the look of each row of data. A difference is a `fail` line named by its place on the screen. (c) A design with no such files is a `fail` line: the builder runs the check. Then read the diff for the four bypasses: a change to a file under `docs/designs/`, a change to the check code that names a screen, a text or a value, and a raw color value, an arbitrary value (`text-[13px]`) or a one-off size in a component, or a size token added to the theme. Each is a `fail` line. **Gate:** every `D<n>` line has a recorded verdict before you go to step 10.
10. **Return the verdict** in the format below. A `pass` is silent. Each rubric list returns one count line, `<list> <n> walked, <m> fail`, and then one line per `fail` or `developer-check` item. A `fail` line names the file and line, the item it violates, and the change that fixes it — specific enough that the builder applies it without a second review. The count line is the proof that the walk happened; a transcript-only watcher (e.g. `/goal`) reads it. Every line the verdict does not need is thinking the review did not need. The workflow ends here.

### A rule that only the rendered page proves

Read the code first — it settles most rules. When only the rendered page can prove a rule (a layout at a width, a responsive step), open the screenshot the builder saved for it (`.output/screens/<app>/<Design>-<width>.png` in the e2e package) with the Read tool. A rule with no screenshot to prove it is a `fail` line that names the screenshot the builder saves. There is no `browser-check` verdict: the builder has the browser.

### The `developer-check` verdict

When only an input the developer produces can prove an item — the `pnpm exec eve traces` of one real turn — record `developer-check` and name the input. The verdict line is complete with that; the developer's step is already in the checklist's `## Manual verification`. Never send the turn, and never hold the verdict open for it: a `/goal` check only sees the transcript, so an item that waits on a developer's paste never resolves and the run loops until the stop-hook cap ends it.

### Verdict format

```
frontend-standards 61 walked, 1 fail
 3 fail — features/invites/ui/member-picker.tsx:12 — imports Base UI; rebuild it on the kit's Popover + Command

recipes applies: recipe-page-with-data (invites-page.tsx), recipe-data-table (columns.tsx); 9 do not apply

recipe-page-with-data Verify 6 walked, 0 fail
recipe-data-table Verify 8 walked, 1 fail
 2 fail — features/invites/ui/columns.tsx:30 — calls the v8 API; use the v9 call the recipe names

e2e-tests 15 walked, 1 fail; 6 E lines, 1 with no test
 3 fail — packages/e2e/flows/admin/invite-member.spec.ts:38 — waits with waitForTimeout; assert the row with a web-first assertion
 E4 fail — no test walks "the member opens the emailed link a second time and sees that it was used"; add it to packages/e2e/flows/admin/invite-member.spec.ts

eve-agent skipped — no eve client

state-machines 23 walked, 1 fail
 4 fail — features/threads/ui/thread-view.tsx:30 — renders from a stage table; render from hasTag

designs 2 walked, 2 fail
 D1 fail — SettingsTeam: "Invite member" box radius: design 10px, built 8px — packages/ui/src/components/button.tsx (the default variant) — give the button the radius token of the design
 D2 fail — SettingsTeamInvite: the gap between the two fields is about twice the gap of the design — features/invites/ui/invite-dialog.tsx:22 — use the gap of the design's `.field` rule

structure 12 files, 1 fail
 components/member-picker.tsx fail — move to features/invites/ui/member-picker.tsx

backend none
```

### When a step fails

- **No checklist path and no branch.** Return no verdict. Say that the review needs a checklist path or a branch.
- **`pnpm lint` cannot run.** Record the command and its error on the item's line as `fail`, and go on with the walk.

## Rules

- **Change no file.** Bash runs read commands only: `git diff`, `git log`, `git status`, and `pnpm lint`; never a test run or a typecheck, and never `pnpm flows` or `pnpm screens`: the builder ran them, and the screenshots and the `.design.json` files are on disk. Never `git commit`, `git push`, `git checkout`, or a command that writes a file.
- **Only the rubric.** A `fail` line names what a rule or Verify item rejects, nothing else — no taste-based changes, no restructuring beyond what the violated item requires.
- **No fail to fill the verdict.** A walk with 0 fails is a normal result. A reviewer told to find faults usually finds some, even when the work is sound (Anthropic, Claude Code best practices). Record `fail` only when the item clearly rejects the code: its own words name the fault, or a user would see the fault the item guards against. A reading that needs a stretch is a `pass`.
- **A test change is a fix only when the test itself violates a rule** (e.g. asserts implementation detail, pastes implementation output as the expectation). The fixed test must still cover the same behavior — never a fix that weakens or deletes a test.
- **The feature checklist is immutable**: never add, remove, reword, or re-check its items.
- **Stop at the frontend.** A backend defect you find goes in the verdict's `backend` block, one observable behavior per line. The builder writes it into the checklist's `## Backend` section and builds it.
