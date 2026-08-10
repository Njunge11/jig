# TDD implementation checklist

How to write a TDD implementation checklist for work that changes what the software does. The builder (implement-backend) implements it with TDD, one task at a time.

## How to fill it

- Copy the spec's wording verbatim. Do not invent labels or microcopy.
- Write each task so its tests can pass the Review checklist of the `backend-tests` skill (invoked in Step 4): one observable behavior, expected values from the spec, testable in its layer's harness.
- If the implementation checklist creates a new app or package, list its setup in Scope: package.json with the standard scripts, tsconfig, vitest setup, drizzle config, `db/schema/`.
- `## Done` holds only what the builder can prove with output it can paste: a test run, a command, or the diff. A spec-stated check that only a human can perform goes under `## Manual verification` — the developer runs it, not the builder.

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

## Manual verification

- <command the developer runs>

## Done

- [ ] Every task box above is checked and shown.
- [ ] Green suite output pasted.
- [ ] `git log` shows one commit per task.
- [ ] `handoffs/NN-<slug>.md` exists.
- [ ] <verification the spec states and the builder can prove, copied word for word>
- [ ] Tracker Status flipped to Done.
- [ ] PR open with its URL and a What/Why/How/Verification body.
```
