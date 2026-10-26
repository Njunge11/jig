---
type: llm
focus: {source: file, path: .eval/diff-app.txt}
weight: 1
---

Judge only the one question below. The input is the git diff of the documents the agent wrote: the implementation checklist, the tracker, and any change to the spec. If the diff has no checklist that decides the question, the verdict is FAIL.

Question: do the frontend tasks keep the committed search term in the URL (a query parameter)?

PASS if a task puts the term in the URL. FAIL if the term lives only in component state.
