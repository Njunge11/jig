---
type: llm
weight: 1
---

Judge only the one point below. Ignore every other quality of the answer. Do not fail the answer for a fault that this point does not name.

PASS if the Edit button is shown through `hasTag("editable")`. FAIL if it compares state names (`value === "collecting" || ...`, `matches("collecting") || matches("reviewing")`) or keeps a list of editable states.
