---
type: llm
focus: {source: file, path: .eval/diff-app.txt}
weight: 1
---

Judge only the one question below. The input is the git diff of the change the agent made to the app code, without its tests. If the diff has no code that decides the question, the verdict is FAIL.

Question: does the event a click on Submit sends reach the server through `trpc.productDraft.send`?

PASS if the panel's submit handler, or the event callback it hands the form, calls `trpc.productDraft.send` (directly, or through its mutation, such as `useMutation(trpc.productDraft.send.mutationOptions())` or `trpc.productDraft.send.useMutation()`). The code may name `{ type: "SUBMIT" }` or pass the form's event through. FAIL if the submit handler does not call `trpc.productDraft.send`, or moves the draft in the browser only.
