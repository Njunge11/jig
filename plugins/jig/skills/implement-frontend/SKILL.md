---
name: implement-frontend
description: Use this skill to build the FRONTEND of a feature — pages, components, queries, mutations — or to rework an existing surface (a prototype, a rule-violating page). The skill builds each screen from its design source file until the design check passes (the built screen looks like the design to a person), then writes and runs the end-to-end tests of the checklist, to a green pnpm flows run and an open PR. Next.js + tRPC + TanStack Query + shadcn + Playwright.
---

# Implement Frontend

Build the frontend of a feature. The checklist drives the work: build each behavior, make each screen look like its design, then prove the slice with its end-to-end tests. This skill runs in the session that the developer starts with the checklist's /goal command — the same session that ran `implement-backend` on the checklist's `## Backend` section, when it has one.

There is no component-test layer: write no jsdom test and no mocked network. The recipes state the correct build, the review checks each recipe item, and the end-to-end tests prove what a person sees (`e2e-tests`, **The two layers**).

**Checklist:** `$ARGUMENTS` — the path to the implementation checklist (`docs/<project>/checklists/NN-<slug>.md` or `features/<name>/checklist.md`). If you did not get a path, find it in the tracker (`docs/<project>/tracker.md`). Reworking a surface that already exists and violates the rules? Use [Existing UI](#existing-ui) instead of the numbered steps.

## The work

1. **Open the checklist, then load the standards.** Read the checklist file first; when it does not exist, or it has a `## Frontend + Integration` section and no `## E2E tests` section, follow [When a step fails](#when-a-step-fails): a missing file loads nothing. Then invoke these skills with the Skill tool, one call each: `e2e-tests`, `frontend-standards`, `structure`, `open-feature-pr`. When the work changes the tRPC client or server wiring, also invoke `frontend-wiring`. When it adds a custom compound component, also invoke `frontend-authoring-custom`. When it touches a client that imports `eve/react`, also invoke `eve-agent`. When it touches a file that imports `xstate` or `@xstate/react`, or shows a machine's stage, also invoke `state-machines`. A skill whose text is already in this session from an earlier run on the same checklist is loaded; invoke it again only when it is not. **Gate:** the transcript shows one Skill call per skill this step names for this checklist, before step 2, and the e2e package exists (`packages/e2e/playwright.config.ts`, or `e2e/playwright.config.ts` in a repo with one app).
2. **Be on the feature branch before any commit.** When the checklist has a `## Backend` section, the `implement-backend` run in this session created the branch named in the checklist's Scope and committed to it locally: check it is the current branch, and build on it. Otherwise run `git checkout -b <type>/<feature-slug>` off an up-to-date `main`, with the branch names from the `open-feature-pr` skill. If the session is already on the branch of this feature, continue on that branch. Never commit feature work to `main` or an unrelated branch. **Gate:** `git branch --show-current` prints the feature branch, not `main`.
3. **Read each design, then restate the UI.** The `## Designs` section of the checklist names the source file of each design (`docs/designs/<Screen>.dc.html`). The source file is the layout, the order, the texts and each value of the screen. Read it as **Build from the source** of the `e2e-tests` skill states: the markup of the screen whole, and the style rule of each class the markup uses. Open the restatement with one paragraph per design: its parts in order, and each part that the app already has (the shell, a shared component) and that differs from the design. Then write the page's anatomy — a named tree of parts, one responsibility per part, one owner per piece of shared state — before any code. The anatomy matches the designs. The `structure` skill places every file this lane produces; never place a file by imitating existing code. A design the checklist names that has no source file in the repo is a stop: report it, and never build a screen from a design you did not read. A checklist written before this standard has a `## Design facts` section: each of its groups names its design, and the group is one design. **Gate:** the restatement names each design and its source file, or states that the checklist has none.
4. **Name the recipes that apply, and load them.** Walk the catalog of the `frontend-standards` skill row by row against every `F<n>` and `V<n>` item of the checklist, and record one verdict per row: `applies` with the item numbers, or `does not apply`. A recipe that the checklist names does not end the walk. Then invoke the recipe skill of every row that applies with the Skill tool. Follow every recipe that applies — the recipe orders the construction. When an item describes a behavior that the Don't list of an applying recipe forbids, the recipe wins: build to the recipe and record the difference in the handoff's **Deviations**. **Gate:** every catalog row has a recorded verdict, and the transcript shows one Skill call per row that applies.
5. **The `## Frontend + Integration` section of the checklist is the task list.** If the checklist does not have that section, author it first as the `implementation-planner` skill's frontend format states: `F<n>` behaviors, `V<n>` widths, and the `## E2E tests` lines. Cover error and empty states, not just the happy path. Preserve described copy verbatim; never invent an undecided screen, state, or label — record the open question in the handoff's **Deviations**. Work through the `F<n>` items with [the loop](#the-loop) below. Wire the real tRPC path against the feature's actual router under `features/<name>/api` — never an invented shape. A value the UI needs that no procedure returns is a backend gap — use [Backend gaps](#backend-gaps) below. **Gate:** every `F<n>` item is `[x]`, and `pnpm typecheck` and `pnpm lint` pass in the app.
6. **Check the `## Rules` list of the `frontend-standards` skill, plus the Verify list of every recipe that step 4 recorded as `applies`, item by item against your diff** (`git diff main`). When the diff touches a client that imports `eve/react`, check the Review checklist of the `eve-agent` skill the same way and run its Gates. When the diff touches a file that imports `xstate` or `@xstate/react`, check the Shared and Frontend items of the Review checklist of the `state-machines` skill the same way and run its Gates for Part A and Part C. Walk the tree and the Placement rules of the `structure` skill over every file the diff adds or moves, and move a misplaced file now. Name each item that the diff violates. Fix each violation. Commit the fixes as one commit. **Gate:** each list has its count line and one line per fixed item, every added or moved file is in its place, and `pnpm typecheck` and `pnpm lint` pass in the app.
7. **Make each screen look like its design.** The `e2e-tests` skill's **The design check** section owns this step. Never tick a `D<n>` or a `V<n>` item from the code alone.
   - For each `D<n>` line that names a route, run the comparison: all the routes of the checklist in one `SCREENS="<Design>=<path> …" pnpm screens` run. A `D<n>` line that names an `E<n>` step is compared by `expectDesign` in that step, in step 8.
   - The run prints each difference with the value of the design and the built value. Fix each one: the screen, the shared part where it lives, or, for a color, the theme file. Build a size with the stock Tailwind class that the run names as the nearest step. Never a raw value or an arbitrary value (`text-[13px]`) in a component, never a size token in the theme, never an exception in the check, never a change to a design file. Run again until the run passes.
   - Then open the two screenshots of each design with the Read tool in one step, and judge the five things the run does not compare: the shape of each icon, the space between the blocks, the width of each table column, the layers of each shadow and gradient, and the look of each row of data. Fix what a person sees at a glance (the `e2e-tests` skill, "What the run does not compare"). Never measure the pictures.
   - For each `V<n>` item, save a screenshot at its width (`WIDTH=<n> SCREENS="…" pnpm screens`), open it with the Read tool, fix what it shows wrong against the responsive rules of `frontend-standards`, and tick the item with the file's path.
   - Commit the fixes: `fix(<feature>): the screens look like their designs`. **Gate:** `pnpm screens` printed its `N passed` line for the routes of the checklist, each such `D<n>` item has its verdict for the five things (`pass`, or `fixed` with file:line), and every `V<n>` item is ticked with a screenshot path.
8. **Write the end-to-end tests, then run them.** The `## E2E tests` section of the checklist is the list, and the `e2e-tests` skill owns the rules. The build is done, so the tests use the real screens, roles and labels.
   - Write one test, or one `test.step` of a journey, per `E<n>` line, in the flow file the checklist names. The name states the line. Each expected value comes from the spec, never from what the screen shows now. Each test makes its own data. A step that opens a design named by a `D<n>` line calls `expectDesign(page, "<Design>")`.
   - Check each new test against the Review checklist of `e2e-tests`. Name each item that is true, fix the test, and check again.
   - Run the Gates of `e2e-tests`: `pnpm lint` and `pnpm typecheck` in the e2e package, then `pnpm flows <flow file>`.
   - A test that fails is a fault that a person meets in the built app. Follow **A test that fails** of `e2e-tests`: fix the app, in this step, with a backend test for the rule when one was missing. Never skip, weaken or delete a test, never change an expected value to the value the app shows, and never start a dev server to look.
   - Tick each `E<n>` line when its test passes. Commit the flow file once: `test(e2e): <the flow>`. **Gate:** every `E<n>` item is `[x]`, `pnpm flows` printed its `N passed` line, each `D<n>` item has its verdict, and the proof names the two report files.
9. **Invoke the `review-frontend-feature` skill** with the checklist path and the branch as its arguments. It runs in a forked, read-only subagent that has no access to this session — that separation is what keeps the review independent. It changes no file; it returns a verdict. Never walk its checklists yourself. The review runs once per section: this invocation is the frontend's one review, and no later step invokes it again. Before you invoke it, read the handoff file: when its `## Review` section already holds this section's verdict, the review ran and a compaction cut the transcript; do not invoke it again, and go on with that verdict. When the verdict returns, write it into the handoff's `## Review` section at once, before the next step: a compaction cuts the transcript, not the file. **Gate:** the handoff's `## Review` section holds the verdict.
10. **Fix every `fail` line of the verdict, in one round.** Apply the change each line names. Only a `fail` line gets a change: a `pass`, `skipped` or `developer-check` line, and any remark the reviewer adds beside the lines, change nothing. A line in the verdict's `backend` block is a backend gap: follow [Backend gaps](#backend-gaps). A `fail` line that names an `E<n>` line with no test gets its test. A `fail` line on a design gets its fix, and one more `pnpm screens` run of that design. Commit the fixes as one commit: `refactor(<feature>): fix review-checklist violations`. That commit is this step's proof, and nothing reviews it: never invoke the review again on the fix, and never walk the rubric over it yourself. A second review of a fix finds new lines in the fix, a fix of those invites a third review, and the run never ends (measured: one run made 18 reviews and ran 3 h 15 min after its PR was open). When a `fail` line asks for a change that contradicts the spec or the checklist, stop and report the line and the conflict. A verdict with no `fail` line needs no commit. A `developer-check` line is already in the checklist's `## Manual verification`. **Gate:** one commit after the review fixes every `fail` line, or the verdict has none; `pnpm typecheck` and `pnpm lint` pass in the app; and when the fix changed a screen or a test, `pnpm flows <flow file>` printed its `N passed` line again.
11. **Write the handoff and flip the tracker.** Write `docs/<project>/handoffs/NN-<slug>.md` — the `handoffs/` folder sits beside the checklist's folder. Use the [handoff format](#handoff-format) below. Its `## Review` section holds the step 9 verdict, written there in step 9, then one `Fix:` line that names the step 10 commit or says `No fail line.` The file is the proof a watcher reads: a paste in the transcript is cut by compaction, the file is not. When the backend run of the same checklist already wrote that file, append your lines to its four sections instead of writing a second file; `## Review` then holds both verdicts, each with its `Fix:` line. Then set this checklist's Status to `Done` in `docs/<project>/tracker.md`. **Gate:** both files exist on the branch and are committed.
12. **Close the checklist's `## Done` section.** Tick each Done item whose proof is on the branch or in this transcript, in the same edit, and commit it. Leave the PR item and the full-suite item for step 13: the push runs the full suite. Do this before the proof, never after a watcher asks: a watcher that reads the file counts an unticked Done item as unmet, and an edit made only because it asked reads as a bypass. **Gate:** every Done item that this run can prove, except the PR item, is `[x]` and committed.
13. **Push once and open the PR as the `open-feature-pr` skill specifies.** That skill owns the branch, title, and body format, and the `gh` steps. Do not make your own format. This is the one push of the slice: the branch carries the backend run's commits too. The pre-push hook runs every end-to-end test of the repo, and refuses the push on a failure: fix the app and push again, never with `--no-verify` or `HUSKY=0`. Then tick the full-suite item with the push's test summary and the PR item, and commit them locally; the next push carries it — When the repo pushes straight to main, follow the `open-feature-pr` skill's **Straight to main** section instead: tick the PR item and the full-suite item in the last commit before the push, because no later push carries a tick. The push and the CI run that section watches are their proof, in this transcript. never push for this tick alone. **Gate:** `gh` returns the PR URL, or `git log --oneline -1 origin/main` shows the pushed commit.
14. **Return the proof** in the format under [Proof format](#proof-format) below. Then a watcher that sees only the transcript (e.g. `/goal`) can verify the work. The proof and the last message report the `E<n>` lines by name, as **The report** of the `e2e-tests` skill states: a count of tests is never the statement that a feature works. The workflow ends here.

### Handoff format

```markdown
# NN — <checklist name>

## What shipped

- <one line per `F<n>`, `V<n>` and `E<n>` item, in checklist order>

## Deviations

- <every change to the feature's scope, and every undecided screen/state/label — or "None.">

## Follow-ups

- <what the next checklist needs from this one — or "None.">

## Review

<the review-frontend-feature verdict, pasted whole: the count lines and the fail lines>
Fix: <the one commit that fixes its fail lines> — or: No fail line.
```

### Proof format

```
skills   e2e-tests, frontend-standards, structure, open-feature-pr — plus frontend-wiring / frontend-authoring-custom / eve-agent / state-machines when the work touches them

checklist features/invites/checklist.md
 [x] F1 the member table shows one row per invitation
 [x] V1 at 375 — packages/e2e/.output/screens/admin/SettingsTeam-375.png
 [x] E1 the owner invites a person and the invite shows as pending
 ... one line per F, V and E item, first to last

frontend-standards 65 walked, 1 fixed
 2 fixed — features/invites/ui/member-picker.tsx:12 (Base UI import replaced with the kit's Popover + Command)
 ... one count line per rubric list, then one line per fixed item; a pass is silent

recipes
 recipe-page-with-data applies — F1 F2
 recipe-data-table applies — F3
 recipe-search-and-filters does not apply
 ... one line per catalog row, first to last

recipe-data-table Verify 8 walked, 0 fixed
 ... one count line per recipe that applies, then its fixed lines

designs  pnpm screens — 2 passed
 D1 SettingsTeam — 0 texts differ, 79 the same; icons, spacing, columns, rows: pass
 D2 SettingsTeamInvite — flow step E1; icons, spacing, columns, rows: fixed — features/invites/ui/invite-dialog.tsx:22 (the gap between the fields)
 ... one line per D item, when the checklist has a ## Designs section

e2e      pnpm flows — 17 passed
 lines   6 of 6 E lines pass — or one line per E line that fails, is blocked or has no test: its name and the cause
 report  packages/e2e/.output/report/admin-flows/index.html
 report  packages/e2e/.output/report/admin-screens/index.html

review   <paste the verdict the review-frontend-feature run returned: the count lines and the fail lines>
fixes    <the commit that fixes every fail line — or: no fail line>
handoff  docs/growth/handoffs/NN-<slug>.md
tracker  docs/growth/tracker.md — NN Status: Done
PR       https://github.com/<org>/<repo>/pull/<n>
```

## Reads

The context is the budget. A build that fills it compacts, and a compacted build forgets what it did (measured: one build compacted 7 times and ran its review 18 times; whole-file reads were 270k–690k characters of it, the skills 31k tokens). So:

- Read the lines a task needs, with Read on a range, never a whole file. `cat <file>` and `sed -n 1,400p <file>` on a source file are whole-file reads: never run them.
- Read the diff once per step that needs it, and keep what you read: never run `git diff main` twice in one step.
- A green test run prints its summary, so paste the summary, never the whole output.
- Write what a later step needs into the handoff file as soon as you have it, never only into the transcript.

## The loop

The task list is immutable. You check items off. You never add, remove, or reword items.

Do these steps for each `F<n>` task, in order.

1. **Build.** Build the behavior the task states, to the recipe that applies and to the design source of its screen: the order of the parts, the texts word for word, and each value through a token or a variant of the theme. Build no more than the task. Write no test here: the `E<n>` lines of the checklist prove the behavior, and their tests are written in step 8, when the flow exists.
2. **Check.** Run `pnpm typecheck` and `pnpm lint` in the app. Fix what they report in the code.
3. **Refactor (optional).** Improve the design only as far as this feature needs. Duplication alone is not a reason to extract.
4. **Commit.** One commit per task. Never batch several tasks into one commit. The message follows the enforced convention of the repo. With commitlint present, that convention is Conventional Commits (`feat(scope): subject`). Write the message under the **Language rules** of the `open-feature-pr` skill. **Never bypass hooks** (`--no-verify` is banned). A failing pre-commit hook is part of the work. Diagnose and fix the hook failure. Hooks can auto-fix and re-stage files (Prettier/ESLint). That result is expected, not an error.
5. **Check the task off.** Then take the next task. The work is done when the list is empty.

While you work:

- A missing case discovered mid-task gets an end-to-end test in step 8. The checklist stays unchanged, and the handoff's **Deviations** names the case.
- A change to the feature's scope goes in the **Deviations** section of the handoff. Never make it silently.

## Backend gaps

A backend gap is a value the UI needs that no procedure returns, or a real backend/contract bug found while integrating. Never patch around one in the client — never derive, hardcode, or fake the value so integration passes without the backend. Do this instead:

1. Write the missing behavior as new items in the `## Backend` section of the feature's checklist — one observable behavior per line. These items are the contract; the frontend builds against them.
2. Keep building the parts the gap does not touch. A part takes the values it renders as props and never knows the backend exists, so every part is buildable now.
3. Invoke the `implement-backend` skill in this session on the same checklist. It builds the unticked `## Backend` items with its loop, runs its review, and does not push, because the checklist has a `## Frontend + Integration` section. Then wire the real procedure in the page tree and return to the step you left.
4. Record the gap in the handoff's **Deviations**: the `## Backend` items you wrote and the commits that build them.

## Existing UI

When the surface already exists but its structure or code violates the rules:

1. Never imitate it — existing code is not a precedent (the `structure` skill's authority rule) — and never rebuild it blind.
2. Do step 1 of [The work](#the-work). Then walk the `## Rules` of the `frontend-standards` skill, plus the Verify list of every recipe whose catalog row matches the surface, over the existing surface; invoke each matching recipe skill with the Skill tool first. Record every violation with `file:line`.
3. If the surface has no end-to-end flow, write its flow first, to the `e2e-tests` skill, and see it pass — it guards the rework.
4. Write the violations as a step implementation checklist (structure-only, behavior unchanged) with `Domain: frontend` in its `## Scope`, then invoke the `implement-steps` skill on it.

## When a step fails

- **A skill in step 1 or step 4 does not load.** Stop and report the skill name and the error. Never build from memory of a skill's rules.
- **The checklist path does not exist.** Do not guess a path. Open `docs/<project>/tracker.md` and take the path from the row of this checklist. If the tracker has no such row, stop and report the missing file.
- **`git checkout -b` reports that the branch exists.** Run `git branch --show-current`. If it is that branch, continue on it. If it is not, run `git checkout <branch>` and continue.
- **The repo has no e2e package.** Stop and tell the developer to run `/jig:scaffold-repo` on the repo: it adds the package and the pre-push hook. Never build a screen with no way to prove it.
- **A design the checklist names has no source file.** Stop and report the design's name. Never build from a picture or from memory of a design.
- **The design check still fails on a part this checklist did not build** (the shell, a shared component, the theme). Fix that part where it lives, in its own commit (`fix(ui): <the part> looks like the design`): each screen shows it, so each checklist would fail on it. Name the commit in the handoff's **Deviations**.
- **A needed value has no procedure.** That is a backend gap — follow [Backend gaps](#backend-gaps). Never derive, hardcode, or fake it in the client.
- **Two tasks already share a commit.** Before the first push, split the commit locally with `git reset --soft` and two commits, and check that `git diff` against the old head prints nothing. After the push, never rewrite history (no rebase, no amend, no force-push): name the commit and both tasks in the handoff's **Deviations**, which meets the Done item.
- **A pre-commit hook rejects the commit.** Fix what the hook reports, then commit again. Never pass `--no-verify`.
- **The checklist has a `## Frontend + Integration` section and no `## E2E tests` section.** An older planner wrote it. Before you build, write the section from the spec, as **The list first** of the `e2e-tests` skill states, with the Done item `Every E item is checked`. Commit it (`docs(<feature>): the e2e list`), and record it in the handoff's **Deviations**. Never build a screen that has no list.
- **An `F<n>`, `V<n>` or `E<n>` item is wrong or missing a case.** The task list is immutable. Build the case under the current task, write its end-to-end test in step 8, and record the difference in the handoff's **Deviations** section.
- **The `review-frontend-feature` invocation at step 9 fails.** Retry it once. If it fails again, state the failure in the proof's `review` line and stop. Never substitute your own walk of the review checklists — that breaks the review's independence.
- **A watcher says the verdict is older than the last commit, or asks for a review of the fix.** The verdict is the one review of step 9, and the commit after it is its fix: that order is the proof, in the handoff's `## Review` section. Do not run the review again. Point the watcher at that section.
- **The checklist and the spec leave a choice open.** Never ask the developer a question in the run: under a goal nobody answers, and the run waits (measured: 24 min for two questions). Take the spec's plain reading, build it, and record the choice in the handoff's **Deviations**. Only a conflict between the spec and the checklist is a stop: report it and end the run.
- **A Done item needs a database command (`db:push`, `db:seed`).** Run it yourself, in this transcript, against the dev database. Never hand it to the developer: under a goal nobody is at the screen, and the run waits.
- **A `## Done` item cannot be met by any rerun.** It demands output that a command prints once (a first-run `added` line, a one-time secret, a URI shown once) or output from another session. The item is wrong, not the database. Edit the item so it accepts the output the command prints on every run (`already on the team`, `nothing changed`, `Changes applied`), commit that edit (`docs(<feature>): done item accepts the idempotent output`), run the command again in this transcript, tick the item with that line, and name the edit in the handoff's **Deviations**. Never delete data to make a first-run line appear again, never ask the developer to choose, never stop.
- **`pnpm flows` fails at step 8, or in the pre-push hook.** Follow the `e2e-tests` skill's **A test that fails** section: read the failed test's name and its trace, fix the app, commit, and run the file again by name (`pnpm flows <name>`). A maximum of 3 runs of the file for a test that fails on and off, never a loop. When you cannot fix it, stop and do not push: name the test, the cause and the report file. Never push with `--no-verify` or `HUSKY=0`.
- **`pnpm flows` or `pnpm screens` says a server already answers on its port.** Another run holds the port: wait for it to end and run again. Never stop a server you did not start, and never change the port.
- **`git push` or `gh` fails at step 13.** Use the **When a step fails** section of the `open-feature-pr` skill. Do not open the PR by another route.
