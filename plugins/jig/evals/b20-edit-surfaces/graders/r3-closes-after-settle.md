---
type: llm
focus: {source: file, path: .eval/diff-app.txt}
weight: 1
---

Judge only the one question below. The input is the git diff of the change the agent made to the app code, without its tests. If the diff has no code that decides the question, the verdict is FAIL.

Question: does the edit dialog close only after the `products.update` mutation succeeds?

PASS if the close (`setOpen(false)` / `onOpenChange(false)`) runs in the mutation's `onSuccess`, or after an awaited `mutateAsync`. FAIL if the submit handler closes the dialog before the mutation answers.
