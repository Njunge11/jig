---
type: llm
focus: {source: file, path: .eval/diff-app.txt}
weight: 1
---

Judge only the one question below. The input is the git diff of the change the agent made to the app code, without its tests. If the diff has no code that decides the question, the verdict is FAIL.

Question: does the handler call exactly one service method (the products service's `deleteProduct`) and run no query?

PASS if yes; building the service and shaping its answer into the result do not count as calls. FAIL if the handler runs a query, uses a repository directly, or calls two or more service methods.
