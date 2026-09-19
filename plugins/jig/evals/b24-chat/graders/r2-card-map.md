---
type: llm
weight: 1
---

Judge only the one point below. Ignore every other quality of the answer. Do not fail the answer for a fault that this point does not name.

PASS if each message iterates `parts` and looks each part up in a card map, and an unknown part type renders nothing. FAIL if the transcript grows a `part.type ===` branch for `data-job-card`, or renders a message as one string.
