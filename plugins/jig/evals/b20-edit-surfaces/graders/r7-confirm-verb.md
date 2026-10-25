---
type: llm
focus: {source: file, path: .eval/diff-app.txt}
weight: 1
---

Judge only the one question below. The input is the git diff of the change the agent made to the app code, without its tests. If the diff has no code that decides the question, the verdict is FAIL.

Question: is the delete confirm's action button labelled with the action verb and its object, such as "Delete product"?

PASS if yes (a pending label such as "Deleting…" beside it is fine). FAIL if the button says OK, Yes, Confirm, Continue or Done, or only "Delete" with no object.
