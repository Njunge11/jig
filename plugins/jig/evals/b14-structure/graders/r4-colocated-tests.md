---
type: llm
weight: 1
---

Judge only the one point below. Ignore every other quality of the answer. Do not fail the answer for a fault that this point does not name.

PASS if the UI test is under `features/invites/ui/__tests__/` and the repo test is `features/invites/db/__tests__/<same name as the repo file>.repo.test.ts`. FAIL if tests sit in a top-level `tests/` folder.
