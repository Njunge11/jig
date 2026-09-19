---
type: llm
weight: 1
---

Judge only the one point below. Ignore every other quality of the answer. Do not fail the answer for a fault that this point does not name.

PASS if the router procedure validates its input, uses a composed base procedure for auth (such as `orgProcedure` or `protectedProcedure`), and calls exactly one service method. It may build the service and map errors. FAIL if the router runs a query, opens a transaction, holds business logic, or calls more than one service method.
