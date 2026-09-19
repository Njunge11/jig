---
type: llm
weight: 1
---

Judge only the one point below. Ignore every other quality of the answer. Do not fail the answer for a fault that this point does not name.

PASS if the rename dialog closes after the mutation succeeds (for example `onOpenChange(false)` / `setOpen(false)` inside `onSuccess`, or after an awaited `mutateAsync`). FAIL if the dialog closes at submit, before the mutation answers.
