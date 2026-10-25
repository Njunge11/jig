---
type: llm
focus: {source: file, path: .eval/diff-app.txt}
weight: 1
---

Judge only the one question below. The input is the git diff of the change the agent made to the app code, without its tests. If the diff has no code that decides the question, the verdict is FAIL.

Question: On success, does the form invalidate the products list query and then reset the form or navigate away?

PASS if success calls `invalidateQueries` for the list the new product changes (such as `trpc.products.list.queryFilter()` or `pathFilter()`) and also calls `form.reset()` or navigates away. FAIL if success does not invalidate a list query, or neither resets the form nor navigates.
