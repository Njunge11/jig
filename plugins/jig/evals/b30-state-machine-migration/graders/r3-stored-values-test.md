---
type: llm
weight: 1
---

Judge only the one point below. Ignore every other quality of the answer. Do not fail the answer for a fault that this point does not name.

PASS if the answer adds or changes a test that takes the stored value `details_complete` (the value rows held before the change), resolves it in the new machine, and asserts that it moves forward — to `role_pending`, `role_complete`, or through a transition it now has. FAIL if no test covers the value the old rows hold, or the tests cover only the new states.
