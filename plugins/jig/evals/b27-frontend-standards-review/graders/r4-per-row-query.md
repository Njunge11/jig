---
type: llm
weight: 1
---

Judge only the one question below. Ignore every other fault the review names or misses.

Question: does the review name the per-row query (`OrderRow` runs `orders.byId` for each id) as an N+1, and give the fix of one list procedure that returns the rows with their data?

PASS if yes. FAIL if the review does not name this fault, or keeps one query per row as the fix.
