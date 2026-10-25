---
type: llm
focus: {source: file, path: .eval/diff-app.txt}
weight: 1
---

Judge only the one question below. The input is the git diff of the change the agent made to the app code, without its tests. If the diff has no code that decides the question, the verdict is FAIL.

Question: Does any browser code narrow the fetched products by the search term?

PASS if no client code narrows the fetched rows by the term (no `.filter(`, `useMemo` or `includes` over the fetched list for the search). FAIL if client code narrows the fetched rows by the term.
