# Step implementation checklist

How to write a step implementation checklist for work that only changes the code's structure, not what the software does. The builder follows its steps directly, one task at a time.

## Writing rules

- Copy the spec's wording verbatim. Do not invent labels, taglines, or microcopy.
- The checklist speaks only to the builder. Do not write rationale, provenance notes, spec corrections, or verification evidence into it.
- The standards skills (`backend-standards`, `backend-tests`, `frontend-standards`, `testing`) prescribe structure, naming, and harness. Do not repeat their content. Do not override it. Existing app code is not a reference.
- A checklist is immutable after a builder starts it.

## Template

Copy `assets/step-implementation-checklist-template.md`. Replace each `<placeholder>` with this checklist's content, following the Section rules below. Save the result as `docs/<project>/checklists/NN-<slug>.md`.

## Section rules

### Steps

- Each step is one concrete, completable unit: branch + baseline, create X, move Y, rewrite Z, update CI.
- Write mechanical rules, never vague intentions.
  - Write: "rewrite `@/lib/db/*` → `@ajiri/db/*` per this mapping"
  - Not: "fix imports"
- The first step is the baseline: the builder runs the standing checks of the affected packages and shows them green.

### Done

- Verification comes from two sources only. Write none of your own.
  1. The standing checks: the `test`/`test:run` and `typecheck` scripts of the affected packages, run unchanged, green at the baseline counts. No other command is a standing check.
  2. Verification the spec states, copied word for word. If a needed proof is not in the spec, ask the developer; the developer writes the decision into the spec.
- Last two items: the tracker flip, then the PR.
- The builder ticks each box (`[ ]` → `[x]`) when it pastes the box's output.

## Run command

The checklist's /goal run command for the tracker:

```
/goal every step and every Done item in docs/<project>/checklists/NN-<slug>.md is shown satisfied in the transcript; for each Done item the pasted proof is the command, its final summary output, and its exit status — full output is not required
```

Rules for every /goal condition: keep it under 4,000 characters. Demand only evidence that can appear in the conversation: pasted output, a PR URL, a ticked checklist. The evaluator reads only the conversation; it cannot run commands or open files.
