# Step implementation checklist

How to write a step implementation checklist for work that only changes the code's structure, not what the software does. The builder follows its steps directly, one task at a time.

## How to fill it

- Copy the spec's wording verbatim. Do not invent labels or microcopy.
- Write each step as a mechanical rule, never a vague intention. A mechanical rule names the files and the exact change, so that two builders produce the same diff from it.
  - Write: "move `apps/web/lib/email/` to `packages/email/src/`, and change every `@/lib/email` import to `@repo/email`"
  - Not: "extract the email code into its own package"
- `## Done` lists verification from two sources only. Do not write your own verification.
  1. The standing checks: the `test`/`test:run` and `typecheck` scripts of the affected packages, run unchanged, green at the baseline counts. No other command is a standing check.
  2. Verification the spec states, copied word for word. If a needed proof is not in the spec, ask the developer; the developer writes the decision into the spec.
- `## Done` holds only what the builder can prove with output it can paste. A spec-stated check that only a human can perform goes under `## Manual verification` — the developer runs it, not the builder. Leave that section out when the spec states none.

## Template

Copy the template below. Replace each `<placeholder>` with this implementation checklist's content. Save it as `docs/<project>/checklists/NN-<slug>.md`.

```markdown
# NN — <checklist name>

## Scope

<What this implementation checklist does.> Spec: `docs/<spec>.md`, section <section>.
Builds on: <earlier checklists, or none>.
Type: <Conventional Commits type>. Branch: `<type>/<slug>`.

## Steps

1. Branch + baseline: create `<type>/<slug>`. Run the standing checks of the affected packages. Record the results.
2. <one concrete, completable step>

## Manual verification

- <verification the spec states that only the developer can perform>

## Done

Tick each box when you paste its output.

- [ ] <standing check command> green at baseline counts, output pasted.
- [ ] <verification the spec states and the builder can prove, copied word for word>
- [ ] Tracker Status flipped to Done.
- [ ] PR open with its URL, opened as the `open-feature-pr` skill specifies.
```
