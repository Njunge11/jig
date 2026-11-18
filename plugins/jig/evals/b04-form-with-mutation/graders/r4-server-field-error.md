---
type: llm
focus: {source: file, path: .eval/diff-app.txt}
weight: 1
---

Judge only the one question below. The input is the git diff of the change the agent made to the app code, without its tests. If the diff has no code that decides the question, the verdict is FAIL.

Question: Does the form draw the failures of its mutation itself, with the title failure on the title field?

PASS if the mutation has `meta: { showsOwnFailure: true }`, its error handling reads the field and the message of the failure (through `describeFailure(error)`, or from `error.data.field` and `error.message`) and calls `form.setError` with that field, and a failure with no field goes to the form (`"root"`). FAIL if the mutation calls `toast.error`, or the title failure only shows a toast, or a failure with no field shows nothing.
