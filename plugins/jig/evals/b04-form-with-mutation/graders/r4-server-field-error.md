---
type: llm
focus: {source: file, path: .eval/diff-app.txt}
weight: 1
---

Judge only the one question below. The input is the git diff of the change the agent made to the app code, without its tests. If the diff has no code that decides the question, the verdict is FAIL.

Question: Does a server error for the title land on the title field through `setError`, while other failures show a toast?

PASS if the mutation's error handling sends the title error to `form.setError("title", { message })` and every other failure to `toast.error(...)`. FAIL if the title error only shows a toast, or other failures show nothing.
