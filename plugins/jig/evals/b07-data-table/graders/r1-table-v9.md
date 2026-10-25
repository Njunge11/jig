---
type: llm
focus: {source: file, path: .eval/diff-app.txt}
weight: 1
---

Judge only the one question below. The input is the git diff of the change the agent made to the app code, without its tests. If the diff has no code that decides the question, the verdict is FAIL.

Question: Does the table use the TanStack Table v9 API, `useTable` with a `features` object from `tableFeatures(...)`?

PASS if the table instance comes from `useTable({ features, columns, data })` with `features = tableFeatures(...)`, and the columns come from `createColumnHelper<typeof features, Row>()`. FAIL if `useTable` or `tableFeatures` is missing.
