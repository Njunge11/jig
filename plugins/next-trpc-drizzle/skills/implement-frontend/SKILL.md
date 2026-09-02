---
name: implement-frontend
description: Use this skill to build the FRONTEND of a feature test-first — pages, components, queries, mutations — or to rework an existing surface (a prototype, a rule-violating page). The skill drives the feature's checklist + TDD loop to a green vitest run and an open PR. Next.js + tRPC + TanStack Query + shadcn.
context: fork
agent: frontend-feature-builder
---

# Implement Frontend

Build the frontend of a feature test-first. The checklist drives the work.

**Checklist:** `$ARGUMENTS` — the path to the implementation checklist (`docs/<project>/checklists/NN-<slug>.md` or `features/<name>/checklist.md`). If you did not get a path, find it in the tracker (`docs/<project>/tracker.md`). Reworking a surface that already exists and violates the rules? Use [Existing UI](#existing-ui) instead of the numbered steps.

## The work

1. **Create the feature branch before any commit**: `git checkout -b <type>/<feature-slug>` off an up-to-date `main`. Use the branch names from the preloaded `open-feature-pr` skill. If the session is already on the branch of this feature, continue on that branch. Never commit feature work to `main` or an unrelated branch. **Gate:** `git branch --show-current` prints the feature branch, not `main`.
2. **Restate the UI.** You usually get it as prose. Write the page's anatomy — a named tree of parts, one responsibility per part, one owner per piece of shared state — before any code. The preloaded `structure` skill places every file this lane produces; never place a file by imitating existing code.
3. **Pick the recipe(s).** Match what you are building against the catalog of the preloaded `frontend-standards` skill. Load every matching recipe file and follow it — the recipe orders the construction.
4. **The `## Frontend + Integration` section of the checklist is the task list.** If the checklist does not have that section, author it first, split into **Behavior (test-backed)** `F<n>` items and **Visual & responsive (browser-checked, never jsdom tests)** `V<n>` items. Cover error and empty states, not just the happy path. Preserve described copy verbatim; never invent an undecided screen, state, or label — record the open question in the handoff's **Deviations**. Work through the `F<n>` items with [the loop](#the-loop) below. **Gate:** every `F<n>` item is `[x]` and `vitest` is green.
5. **Integrate.** Wire the real tRPC path against the feature's actual router under `features/<name>/api` — never an invented shape. The behavior tests must pass against the real router. A value the UI needs that no procedure returns is a backend gap — use [Backend gaps](#backend-gaps) below. **Gate:** the behavior tests are green against the real router, or the gap is written per Backend gaps.
6. **Check the `## Rules` list of the preloaded `frontend-standards` skill, plus the Verify list of every recipe you loaded, item by item against your diff** (`git diff main`). Name each item that the diff violates. Fix each violation. Commit the fixes as one commit. **Gate:** every item has a recorded verdict and `vitest` is green.
7. **Visual & responsive.** Verify each `V<n>` item in the browser at 375, 768, 1024, and 1440, and tick it. When you cannot run a browser, leave the item unticked and list it in the proof as `browser-check`. Never tick a `V<n>` item from the code alone. **Gate:** every `V<n>` item is ticked or listed as `browser-check`.
8. **Write the handoff and flip the tracker.** Write `docs/<project>/handoffs/NN-<slug>.md` — the `handoffs/` folder sits beside the checklist's folder. Use the [handoff format](#handoff-format) below. Then set this checklist's Status to `Done` in `docs/<project>/tracker.md`. **Gate:** both files exist on the branch and are committed.
9. **Open the PR as the preloaded `open-feature-pr` skill specifies.** That skill owns the branch, title, and body format, and the `gh` steps. Do not make your own format. **Gate:** `gh` returns the PR URL.
10. **Invoke the `review-frontend-feature` skill** with the checklist path and the branch as its arguments. It runs the independent review in its own forked subagent, which has no access to this session — that separation is what keeps the review independent. Never walk its checklists yourself. **Gate:** the invocation returns the per-item verdict and a green suite run.
11. **Return the proof** in the format under [Proof format](#proof-format) below. Then a watcher that sees only the transcript (e.g. `/goal`) can verify the work. The workflow ends here.

### Handoff format

```markdown
# NN — <checklist name>

## What shipped

- <one line per `F<n>` and `V<n>` item, in checklist order>

## Deviations

- <every change to the feature's scope, and every undecided screen/state/label — or "None.">

## Follow-ups

- <what the next checklist needs from this one, including any backend gap — or "None.">
```

### Proof format

```
checklist features/invites/checklist.md
 [x] F1 the member table renders one row per invitation
 [x] V2 verified at 375/768/1024/1440 — or: V2 browser-check
 ... one line per F and V item, first to last

frontend-standards
 1 pass
 2 fixed — features/invites/ui/member-picker.tsx:12 (Base UI import replaced with the kit's Popover + Command)
 ... one line per rule, first to last

data-table.md Verify
 1 pass
 ... one line per item, per loaded recipe

handoff  docs/growth/handoffs/NN-<slug>.md
tracker  docs/growth/tracker.md — NN Status: Done
suite    <paste the full green `vitest` run>
PR       https://github.com/<org>/<repo>/pull/<n>
review   <paste the verdict the review-frontend-feature run returned: one line per item, plus its suite run>
```

## The loop

The task list is immutable. You check items off. You never add, remove, or reword items.

Do these steps for each `F<n>` task, in order. A task can need several tests. Write them one at a time — never all up front. The first implementation decision invalidates the speculative remaining tests.

1. **Red.** Write one real, runnable test for the task, driven through what the user sees and does — MSW at the network edge, or seed the cache. Run the test to see it fail. A test that passes before the implementation exists does not test the new behavior.
2. **Self-check.** Check the test against each item of the Review checklist of the preloaded `frontend-tests` skill. Name each item that is true, fix the test, and check again. A test that fails the checklist breaks on refactors and proves nothing.
3. **Green.** Change the **code** until this test and all previous tests pass. Do nothing more. Do not refactor yet. A red test is fixed in the code, never in the test: do not weaken an assertion, change an expected value to match the output, or delete or skip a test to get to green. The one exception: a test that contradicts the spec — fix that test to say what the spec says.
4. **Repeat** steps 1–3 until the task's tests cover the task.
5. **Refactor (optional).** Now improve the design, but only as far as this feature needs. Duplication alone is not a reason to extract. Tests stay green through this step.
6. **Commit.** One commit per task, when the task's tests pass. Never batch several tasks into one commit. The message follows the enforced convention of the repo. With commitlint present, that convention is Conventional Commits (`feat(scope): subject`). Write the message under the **Language rules** of the preloaded `open-feature-pr` skill. **Never bypass hooks** (`--no-verify` is banned). A failing pre-commit hook is part of the work. Diagnose and fix the hook failure. Hooks can auto-fix and re-stage files (Prettier/ESLint). That result is expected, not an error.
7. **Check the task off.** Then take the next task. The work is done when the list is empty.

While you work:

- A missing case discovered mid-task gets its test. The checklist stays unchanged.
- A change to the feature's scope goes in the **Deviations** section of the handoff. Never make it silently.

## Backend gaps

A backend gap is a value the UI needs that no procedure returns, or a real backend/contract bug found while integrating. Never patch around one in the client — never derive, hardcode, or fake the value so integration passes without the backend — and never write backend code in this lane. Do this instead:

1. Write the missing behavior as new items in the `## Backend` section of the feature's checklist — one observable behavior per line. These items are the contract; the frontend builds against them.
2. If the project has a tracker (`docs/<project>/tracker.md`), append a row for this gap in the same edit: Status `Not started`, run command in the tracker's TDD form, pointing at the checklist that holds the new items. The tracker is the ledger of owed work — an item that is not in it gets lost.
3. Keep building — the whole UI, gap-dependent parts included. A part takes the values it renders as props and never knows the backend exists, so every part is buildable now. The behavior tests drive the parts with fixture props shaped by the written contract.
4. Wire when the backend lands. Connecting the real procedure in the page tree is the only work that waits — a call to a procedure that is not on the router does not typecheck.
5. Report the gap in the proof and the handoff's **Follow-ups**: the `## Backend` items you wrote and the call sites that wait. The main session dispatches the `backend-feature-builder` agent; the step-5 integration gate completes after the backend items are green.

## Existing UI

When the surface already exists but its structure or code violates the rules:

1. Never imitate it — existing code is not a precedent (the `structure` skill's authority rule) — and never rebuild it blind.
2. Walk the `## Rules` of the preloaded `frontend-standards` skill, plus the matching recipe's Verify list, over the existing surface; record every violation with `file:line`.
3. If the surface has no behavior tests, write them first with [the loop](#the-loop) — they guard the rework.
4. Write the violations as a step implementation checklist (structure-only, behavior unchanged) with `Domain: frontend` in its `## Scope`, and run it through the `implement-steps` lane.

## When a step fails

- **The checklist path does not exist.** Do not guess a path. Open `docs/<project>/tracker.md` and take the path from the row of this checklist. If the tracker has no such row, stop and report the missing file.
- **`git checkout -b` reports that the branch exists.** Run `git branch --show-current`. If it is that branch, continue on it. If it is not, run `git checkout <branch>` and continue.
- **A new test passes before you write the implementation.** The test does not test the new behavior. Rewrite the test to assert the behavior the task states. Never continue from a green Red step.
- **A task will not go green.** Fix the code, never the test. The only permitted test edit is a fix to a test that contradicts the spec. If the spec and the checklist conflict, stop and report the conflict.
- **A needed value has no procedure.** That is a backend gap — follow [Backend gaps](#backend-gaps). Never derive, hardcode, or fake it in the client.
- **A pre-commit hook rejects the commit.** Fix what the hook reports, then commit again. Never pass `--no-verify`.
- **An `F<n>` or `V<n>` item is wrong or missing a case.** The task list is immutable. Write the extra test under the current task. Record the difference in the handoff's **Deviations** section.
- **`git push` or `gh` fails at step 9.** Use the **When a step fails** section of the preloaded `open-feature-pr` skill. Do not open the PR by another route.
- **The `review-frontend-feature` invocation at step 10 fails.** Retry it once. If it fails again, state the failure in the proof's `review` line and stop. Never substitute your own walk of the review checklists — that breaks the review's independence.
