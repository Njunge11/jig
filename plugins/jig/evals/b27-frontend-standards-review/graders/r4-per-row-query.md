---
type: llm
weight: 1
---

Judge only the one point below. Ignore every other quality of the answer. Do not fail the answer for a fault that this point does not name.

PASS if the review names this fault: one query per row (`CandidateRow` fetches by id) is an N+1; the list procedure must return the rows. FAIL if it does not name it.
