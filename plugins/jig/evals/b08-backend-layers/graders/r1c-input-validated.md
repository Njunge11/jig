---
type: llm
focus: {source: file, path: .eval/diff-app.txt}
weight: 1
---

Judge only the one question below. The input is the git diff of the change the agent made to the app code, without its tests. If the diff has no code that decides the question, the verdict is FAIL.

Question: does `orders.cancel` validate its input with a Zod schema passed to `.input(...)`?

PASS if the procedure's builder chain calls `.input(...)` with a Zod schema, written inline or as a named constant, wherever the chain is written: as a key of the router object, as a separate constant, or after other calls such as `.meta(...)`. FAIL if the procedure has no `.input(...)`, or its handler parses or checks the raw input itself.
