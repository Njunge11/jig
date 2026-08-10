# TDD implementation checklist

How to write a TDD implementation checklist for work that changes what the software does. The builder (build-backend-feature) implements it with TDD, one task at a time.

## How to fill it

- Copy the spec's wording verbatim. Do not invent labels or microcopy.
- For TDD, the `backend-tests` and `testing` skills are the guide. Write tasks their harness can test.
- If the implementation checklist creates a new app or package, list its setup in Scope: package.json with the standard scripts, tsconfig, vitest setup, drizzle config, `db/schema/`.

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

## Skills

<the skills the build runs under — documentation only; the builder's preload delivers them>

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
- [ ] <invariants the spec states, copied word for word>
- [ ] Tracker Status flipped to Done.
- [ ] PR open with its URL and a What/Why/How/Verification body.
```
