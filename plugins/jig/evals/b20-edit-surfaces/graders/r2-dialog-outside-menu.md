---
type: llm
weight: 1
---

Judge only the one point below. Ignore every other quality of the answer. Do not fail the answer for a fault that this point does not name.

PASS if the dialogs opened from the menu are controlled (`open` / `onOpenChange` state) and rendered outside `DropdownMenuContent`. FAIL if a `DialogTrigger` (or `AlertDialogTrigger`) sits inside `DropdownMenuContent`.
