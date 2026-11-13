---
type: llm
weight: 1
---

The spec has a table of 6 actions by 3 roles: 18 cells.

PASS if both are true:
1. For the Manager and for the Viewer, the list has at least one line where the role does an allowed action and at least one line where the role is refused.
2. The list does not give each of the 18 cells its own line: the lines about the table are clearly fewer than 18.

FAIL if the list has one line per cell of the table, or if the Manager or the Viewer has no refused line.
