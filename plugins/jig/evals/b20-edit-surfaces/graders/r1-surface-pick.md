---
type: llm
focus: {source: file, path: .eval/diff-app.txt}
weight: 1
---

Judge only the one question below. The input is the git diff of the change the agent made to the app code, without its tests. If the diff has no code that decides the question, the verdict is FAIL.

Question: is the "Edit details" form built in a `Dialog`, not in a `Sheet`, a `Drawer`, or inline in the row?

PASS if the form is inside a `Dialog`. FAIL if it is inside a `Sheet` or `Drawer`, or edited inline in the row.
