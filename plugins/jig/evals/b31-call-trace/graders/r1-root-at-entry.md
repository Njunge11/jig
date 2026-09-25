---
type: llm
weight: 1
---

Judge only the one point below. Ignore every other quality of the answer. Do not fail the answer for a fault that this point does not name.

PASS if the answer's code opens one call-trace root where the request enters: a `traceBlock` (or the same helper under another name from `call-trace.ts`) written out either in a middleware of the base procedure or around the procedure's one service call, with a line of the form `calling <name> to <purpose>`. FAIL if the procedure calls the service with no root opened, if the answer only assumes a root middleware already exists without writing it, or if the root is opened inside the service or the repo instead of at the entry.
