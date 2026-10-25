---
type: llm
focus: {source: file, path: .eval/diff-app.txt}
weight: 1
---

Judge only the one question below. The input is the git diff of the change the agent made to the app code, without its tests. If the diff has no code that decides the question, the verdict is FAIL.

Question: when the chat has an `error`, does the chat surface render it inline, inside the conversation, with a retry control that calls `regenerate()` or resends the message?

PASS if yes. FAIL if the error goes only to a toast, to a route error boundary, or is not rendered, or if there is no retry.
