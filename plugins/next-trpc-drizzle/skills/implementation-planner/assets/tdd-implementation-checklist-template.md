# NN — <checklist name>

## Scope

<What this builds.> Spec: `docs/<spec>.md`, section <section>.
Target: <app or package>, feature <slug>. Builds on: <earlier checklists, or none>.

One-time scaffold (first checklist of a new app only):
- <the scaffold items from the Scope rules>

## Skills

<the skills the build runs under — documentation only; the builder's preload delivers them>

## Backend

### <source file>

- [ ] <one task: an observable behavior with expected values from the spec>

## Frontend + Integration

<!-- only when the feature has UI -->

### Behavior (test-backed)

- [ ] <what the user observes and does>

### Visual & responsive (browser-checked, not tests)

- [ ] <layout, spacing, tokens, the md: state>

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
