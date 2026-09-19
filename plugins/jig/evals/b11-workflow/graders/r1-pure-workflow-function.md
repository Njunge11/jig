---
type: llm
weight: 1
---

Judge only the one point below. Ignore every other quality of the answer. Do not fail the answer for a fault that this point does not name.

PASS if the `"use workflow"` function lives in `index.ts`, only orchestrates steps and branches on their results, and itself does no I/O, clock read, randomness or service call. FAIL if it calls a service or the network directly.
