---
type: llm
weight: 1
---

Judge only the one point below. Ignore every other quality of the answer. Do not fail the answer for a fault that this point does not name.

PASS if `execute` is a named function declared at module scope and passed by name, and the service is composed at module scope. FAIL if a factory function builds the tool or declares `execute` inside a function body.
