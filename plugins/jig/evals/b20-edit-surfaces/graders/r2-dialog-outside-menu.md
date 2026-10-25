---
type: llm
focus: {source: file, path: .eval/diff-app.txt}
weight: 1
---

Judge only the one question below. The input is the git diff of the change the agent made to the app code, without its tests. If the diff has no code that decides the question, the verdict is FAIL.

Question: are both the edit dialog and the delete confirm rendered outside `DropdownMenuContent` (no `Dialog`, `AlertDialog`, `DialogTrigger` or `AlertDialogTrigger` inside it), each opened by `open` state that the row owns and that the menu item sets?

PASS if yes for both. FAIL if either dialog, or a trigger of one, sits inside `DropdownMenuContent`, or if either dialog has no `open` state that the menu item sets.
