---
type: llm
focus: {source: file, path: .eval/diff-app.txt}
weight: 1
---

Judge only the one question below. The input is the git diff of the change the agent made to the app code, without its tests. If the diff has no code that decides the question, the verdict is FAIL.

Question: is the orders service constructed once at module scope (outside every function) in `agent/tools/get_order.ts`?

PASS if `makeOrdersService(...)` is called at the top level of the tool file and `execute` uses that value. FAIL if the service is constructed inside `execute`, inside another function, or not in the tool file at all.
