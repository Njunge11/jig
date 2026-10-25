---
type: llm
focus: {source: file, path: .eval/diff-app.txt}
weight: 1
---

Judge only the one question below. The input is the git diff of the change the agent made to the app code, without its tests. If the diff has no code that decides the question, the verdict is FAIL.

Question: while the edit form has unsaved changes, does a click on the backdrop leave the dialog open?

PASS if code blocks the close on an outside click while the form is dirty (for example `onInteractOutside` or `onPointerDownOutside` calling `preventDefault()` when dirty). FAIL if nothing blocks it.
