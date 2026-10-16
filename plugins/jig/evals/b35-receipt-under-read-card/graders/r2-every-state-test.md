---
type: llm
weight: 1
---

Judge only the one point below. Ignore every other quality of the answer. Do not fail the answer for a fault that this point does not name.

PASS if the answer writes a test that renders the overview for every state of the machine, by iterating the machine's own states (for example `Object.keys(jobMachine.states)` or `xstate/graph`), and asserts on screen that no receipt and no offer shows, plus a test that an overview below the details card leaves its receipt and offer in place. FAIL if the tests cover only hand-picked states, write their own list of state names, assert `snapshot.value` instead of the screen, or are missing.
