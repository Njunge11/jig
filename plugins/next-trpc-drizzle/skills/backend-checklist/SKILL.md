---
name: backend-checklist
description: Use after agreeing a feature's backend design to turn it into the `## Backend` test list in features/<name>/checklist.md — one behavior per line, ready to drive implement-backend. Owns the checklist file shape.
---

# Backend Checklist

Turn the backend design agreed **in this conversation** into the `## Backend` section of `features/<name>/checklist.md` — the TDD test list (tdd) of backend behaviors to assert (testing). **Authoring only: no code, no tests.**

## How

- Read the agreed design from context; don't re-derive it. If a behavior needs a decision that wasn't made, **ask**.
- List each behavior as an unchecked box with a `B<n>` id, under `## Backend`, in a file titled `# <name> — feature checklist`:

  ```md
  # <name> — feature checklist

  ## Backend
  - [ ] B1 correct credentials return a session
  - [ ] B2 wrong password is rejected
  ```

- Cover the whole behavior space, not just the happy path — include edge cases, error/failure paths, and authz outcomes (per tdd).
- Write only the title and `## Backend`. The frontend section is frontend-checklist's job, in Phase 2.
- **Stop at authoring.** Present it for review; don't build — that's implement-backend.
