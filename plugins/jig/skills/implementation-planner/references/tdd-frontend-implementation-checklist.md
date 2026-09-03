# TDD implementation checklist — frontend

How to write a TDD implementation checklist for frontend work that changes what the software does. The builder (implement-frontend) implements it with TDD, one task at a time.

## How to fill it

- Copy the spec's wording verbatim. Do not invent labels, headings, or microcopy.
- Split the tasks into **Behavior (test-backed)** `F<n>` items and **Visual & responsive (browser-checked, never jsdom tests)** `V<n>` items. A behavior is testable in jsdom through what the user sees and does; layout, spacing, and breakpoints are not — they go under `V<n>`.
- When mockup images come with the spec, add a `## Design facts` section: one `D<n>` statement per checkable fact, grouped by image. A fact states one thing the image shows — a part, its position or order, its count, its alignment, its variant, or its copy word for word. Never write a pixel size or a color read off the image: the codebase's design system supplies the tokens, so a fact says "icon-only", "muted", or "beside the day name" — never "32px" or "#6b7280".
- Write each `V<n>` item to cite the `D<n>` facts it verifies, e.g. `V2 (D4–D7) At 768 ...`. A fact about copy, counts, or states is jsdom-testable — cover it with an `F<n>` item.
- When you write a `## Design facts` section, add this item to `## Done`: `- [ ] One verdict per D item pasted: pass, fixed with file:line, or browser-check.` It makes the builder's fact walk visible to the /goal watcher.
- Write each `F<n>` task so its tests can pass the Review checklist of the `frontend-tests` skill (invoked in Step 4): one observable behavior, expected values from the spec, driven through what the user sees and does.
- Each failure path and each empty state the spec states is a behavior: give it its own `F<n>` task. The task list is the feature's coverage contract — a behavior with no task gets no test.
- Write no `## Backend` section. Backend work gets its own checklist. The builder adds a `## Backend` section only for a gap it discovers while integrating.
- `## Done` holds only what the builder can prove with output it can paste: a test run, a command, or the diff. A spec-stated check that only a human can perform goes under `## Manual verification` — the developer runs it, not the builder.

## Template

Copy the template below. Replace each `<placeholder>` with this implementation checklist's content. Save it as `docs/<project>/checklists/NN-<slug>.md`.

```markdown
# NN — <checklist name>

## Scope

<What this builds.> Spec: `docs/<spec>.md`, section <section>.
Target: <app>, feature <slug>. Builds on: <earlier checklists, or none>.
Type: <Conventional Commits type>. Branch: `<type>/<slug>`.

## Design facts

<Only when mockup images came with the spec; omit the section otherwise.>
Transcribed from the mockup images. The builder builds to these statements, and the builder and the reviewer each walk them against the diff.

### <image 1: what it shows>

- D1 <one checkable statement from the image>

## Frontend + Integration

### Behavior (test-backed)

- [ ] F1 <one task: an observable behavior with expected values from the spec>

### Visual & responsive (browser-checked, never jsdom tests)

- [ ] V1 <one visual or responsive check, with its breakpoints>

## Manual verification

- <check the developer performs in the browser>

## Done

- [ ] Every F item above is checked and shown; every V item is checked or listed as browser-check.
- [ ] Green `vitest` output pasted.
- [ ] `git log` shows one commit per task.
- [ ] `docs/<project>/handoffs/NN-<slug>.md` exists.
- [ ] <verification the spec states and the builder can prove, copied word for word>
- [ ] Tracker Status flipped to Done.
- [ ] PR open with its URL, opened as the `open-feature-pr` skill specifies.
- [ ] The `review-frontend-feature` verdict pasted: one line per item, plus its suite run.
```
