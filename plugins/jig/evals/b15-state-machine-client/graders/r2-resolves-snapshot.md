---
type: llm
weight: 1
---

Judge only the one point below. Ignore every other quality of the answer. Do not fail the answer for a fault that this point does not name.

PASS if the client turns the stored snapshot into a machine snapshot with the machine (`jobDraftMachine.resolveState(...)` or an equal restore call) before it reads it. FAIL if it reads raw fields of the stored JSON such as `snapshot.value`.
