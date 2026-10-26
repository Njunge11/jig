---
type: llm
focus: {source: file, path: .eval/diff-app.txt}
weight: 1
---

Judge only the one question below. The input is the git diff of the documents the agent wrote: the implementation checklist, the tracker, and any change to the spec. If the diff has no checklist that decides the question, the verdict is FAIL.

Question: do the frontend tasks debounce the search, so that typing a term fires one query after a pause rather than one query per keystroke?

PASS if a task states a debounce of the search: the term commits to the URL after a debounce, or the query fires once after the debounce. FAIL if no task debounces the search, or a task fires a query on each keystroke.
