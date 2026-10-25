---
type: llm
focus: {source: file, path: .eval/diff-app.txt}
weight: 1
---

Judge only the one question below. The input is the git diff of the change the agent made to the app code, without its tests. If the diff has no code that decides the question, the verdict is FAIL.

Question: is the default export of the `get_order` tool file the value that `defineTool(...)` returns, with no factory around the tool?

PASS if the file default-exports the result of `defineTool(...)`: `export default defineTool(...)`, or a constant that holds the `defineTool(...)` result and that the file then default-exports. FAIL if the default export is a factory, or the result of a factory call that builds the tool (such as `export default makeGetOrder({ db })`), or the file has no default export, or the tool is not built with `defineTool`.
