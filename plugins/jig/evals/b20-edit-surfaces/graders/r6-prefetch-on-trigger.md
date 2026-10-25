---
type: llm
focus: {source: file, path: .eval/diff-app.txt}
weight: 1
---

Judge only the one question below. The input is the git diff of the change the agent made to the app code, without its tests. If the diff has no code that decides the question, the verdict is FAIL.

Question: when the edit dialog opens, is the product's data (`products.byId`) already in the cache, so the dialog does not open into a fresh loading state?

PASS if `products.byId` is prefetched on the trigger (hover or focus of the row or menu, or the menu opening) before the dialog opens. FAIL if the dialog first starts the `products.byId` fetch after it opens.
