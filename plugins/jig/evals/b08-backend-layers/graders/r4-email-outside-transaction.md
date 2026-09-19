---
type: llm
weight: 1
---

Judge only the one point below. Ignore every other quality of the answer. Do not fail the answer for a fault that this point does not name.

PASS if `email.send` runs outside the open database transaction: after the commit, or through an outbox row written inside the transaction and sent by a separate process or workflow step. FAIL if `email.send` is called inside the `db.transaction(...)` callback.
