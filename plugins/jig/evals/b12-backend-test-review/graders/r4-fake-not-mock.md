---
type: llm
weight: 1
---

Judge only the one point below. Ignore every other quality of the answer. Do not fail the answer for a fault that this point does not name.

PASS if the review names this fault: the test mocks our own repo with `vi.fn`, where a service test uses an in-memory fake repo. FAIL if it does not name it.
