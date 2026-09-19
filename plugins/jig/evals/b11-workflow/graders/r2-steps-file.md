---
type: llm
weight: 1
---

Judge only the one point below. Ignore every other quality of the answer. Do not fail the answer for a fault that this point does not name.

PASS if the `"use step"` functions live in a separate `steps.ts` and are the place that calls the services. FAIL if steps and workflow share one file.
