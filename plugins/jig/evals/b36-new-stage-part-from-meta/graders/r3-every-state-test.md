---
type: llm
weight: 1
---

Judge only the one point below. Ignore every other quality of the answer. Do not fail the answer for a fault that this point does not name.

PASS if the answer writes a test that iterates every state of the machine (from the machine itself, not a hand-written list) and asserts on screen that the offer shows exactly in the states whose meta names it, and never under the overview card. A table of expected results keyed by the machine's own state type (for example `satisfies Record<StateValue, …>`, so a new state fails the typecheck until it has a row) passes, as long as the test iterates the machine's states. FAIL if the tests check only the new state, hand-pick states, iterate a hand-written list of state names that the machine's type does not check, or are missing.
