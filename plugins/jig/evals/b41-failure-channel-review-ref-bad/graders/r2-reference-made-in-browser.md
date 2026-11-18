---
type: llm
weight: 1
---

Judge only the one question below. Ignore every other fault the review names or misses.

Question: does the review name the error reference that the browser makes (`crypto.randomUUID()` in `app/orders/error.tsx`) as a fault, and say that the reference must be the one of the server (through `describeFailure` or the shared `RouteError` page), never one that the screen makes?

PASS if yes. FAIL if the review does not name this fault.
