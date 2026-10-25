---
type: llm
focus: {source: file, path: .eval/diff-app.txt}
weight: 1
---

Judge only the one question below. The input is the git diff of the change the agent made to the app code, without its tests. If the diff has no code that decides the question, the verdict is FAIL.

Question: Does the success toast name the action and offer an Undo that calls the `products.unarchive` mutation?

PASS if the success toast names the action (such as "Product archived") and its action button's handler calls the `products.unarchive` mutation for that product. FAIL if there is no Undo, the Undo only edits the client cache, or the archive is delayed instead of committed.
