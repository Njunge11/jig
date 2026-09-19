---
type: llm
weight: 1
---

Judge only the one point below. Ignore every other quality of the answer. Do not fail the answer for a fault that this point does not name.

PASS if a missing job and a forbidden caller are returned as values such as `{ status: "notFound" | "forbidden", message }`. FAIL if they are thrown.
