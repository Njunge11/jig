---
type: llm
focus: {source: file, path: .eval/diff-app.txt}
weight: 1
---

Judge only the one question below. The input is the git diff of the change the agent made to the app code, without its tests. If the diff has no code that decides the question, the verdict is FAIL.

Question: does the `"use workflow"` function only call step functions (and workflow primitives such as `sleep`), with no service, database, network or email call of its own?

PASS if every call in its body is a `"use step"` function or a workflow primitive. FAIL if the workflow function calls `fraud`, `orders`, `notifications`, `email`, `fetch` or a database itself.
