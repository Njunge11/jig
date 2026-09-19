---
type: llm
weight: 1
---

Judge only the one point below. Ignore every other quality of the answer. Do not fail the answer for a fault that this point does not name.

PASS if interaction state is exposed as `data-state` and each part has a kebab-case `data-slot`. FAIL if state is styled through per-state className props.
