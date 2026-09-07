# TDD implementation checklist — backend

How to write a TDD implementation checklist for backend work that changes what the software does. The builder (implement-backend) implements it with TDD, one task at a time.

## How to fill it

- Copy the spec's wording verbatim. Do not invent labels or microcopy.
- Write each task so its tests can pass the Review checklist of the `backend-tests` skill (invoked in Step 4): one observable behavior, expected values from the spec, testable in its layer's test setup.
- Each failure path the spec states is a behavior: give it its own task. The task list is the feature's coverage contract — a behavior with no task gets no test.
- Each entry-point call the checklist adds or changes (a procedure, an MCP tool, an eve tool, a workflow step) gets one statement-budget task. List the statements the behavior needs, one per row set read or written, and write the count and the list into the task. The builder's test asserts that exact count on the real database (`backend-standards` § "Queries & performance"; `backend-tests` Review item 14). Derive the list from the spec and the repo audit, never from a run.
- If the implementation checklist creates a new app or package, list its setup in Scope: package.json with the standard scripts, tsconfig, vitest setup, drizzle config, `db/schema/`.
- `## Done` holds only what the builder can prove with output it can paste: a test run, a command, or the diff. A spec-stated check that only a human can perform goes under `## Manual verification` — the developer runs it, not the builder.
- A check the repo runs from a script is the builder's, even when it needs a key. When the script does not load its keys, the checklist's first task makes it (`dotenv -e .env -- …`), and the check is a Done item. Only a check with no script (a browser, a device, a person) is manual.

## Template

Copy the template below. Replace each `<placeholder>` with this implementation checklist's content. Save it as `docs/<project>/checklists/NN-<slug>.md`.

```markdown
# NN — <checklist name>

## Scope

<What this builds.> Spec: `docs/<spec>.md`, section <section>.
Target: <app or package>, feature <slug>. Builds on: <earlier checklists, or none>.
Type: <Conventional Commits type>. Branch: `<type>/<slug>`.

Setup (only when this checklist creates a new app or package):
- <the setup items from the How to fill it rules>

## Backend

### <source file>

- [ ] <one task: an observable behavior with expected values from the spec>
- [ ] <the call> runs exactly <N> statements: <one line per statement, naming the row set it reads or writes>

## Manual verification

- <command the developer runs>

## Done

- [ ] Every task box above is checked and shown.
- [ ] Green suite output pasted.
- [ ] `git log` shows one commit per task.
- [ ] `docs/<project>/handoffs/NN-<slug>.md` exists.
- [ ] <verification the spec states and the builder can prove, copied word for word>
- [ ] Tracker Status flipped to Done.
- [ ] PR open with its URL, opened as the `open-feature-pr` skill specifies.
- [ ] The `review-backend-feature` verdict pasted: one line per item, plus its suite run.
```
