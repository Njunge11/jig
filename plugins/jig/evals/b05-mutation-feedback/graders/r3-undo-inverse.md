---
type: llm
weight: 1
---

Judge only the one point below. Ignore every other quality of the answer. Do not fail the answer for a fault that this point does not name.

PASS if the success toast names the action and its Undo calls the inverse mutation `jobs.unarchive`. FAIL if there is no Undo, or the Undo only edits the client cache.
