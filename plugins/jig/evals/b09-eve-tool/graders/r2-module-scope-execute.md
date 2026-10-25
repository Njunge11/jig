---
type: llm
focus: {source: file, path: .eval/diff-app.txt}
weight: 1
---

Judge only the one question below. The input is the git diff of the change the agent made to the app code, without its tests. If the diff has no code that decides the question, the verdict is FAIL.

Question: in `agent/tools/get_order.ts`, is the function passed as `execute` declared at module scope (outside every function) and passed by name?

PASS if `defineTool` receives `execute: <name>` (or the `execute` shorthand) and `<name>` is a function declared at the top level of the file. FAIL if a factory function builds the tool, `execute` is declared inside a function body, or `execute` is an inline function written inside the `defineTool` call.
