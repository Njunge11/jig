---
type: llm
weight: 1
---

Judge only the one point below. Ignore every other quality of the answer. Do not fail the answer for a fault that this point does not name.

PASS if the review names this fault: the class name `text-${tone}-600` is built from a template literal, which Tailwind cannot see; map the tone to full class strings. FAIL if it does not name it.
