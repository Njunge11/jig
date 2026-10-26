---
type: llm
focus: {source: file, path: .eval/diff-app.txt}
weight: 1
---

Judge only the one question below. The input is the git diff of the documents the agent wrote: the implementation checklist, the tracker, and any change to the spec. If the diff has no checklist that decides the question, the verdict is FAIL.

Question: does a task under `## Backend` make a procedure take the search term as input and narrow the products on the server?

PASS if such a task exists. FAIL if no Backend task takes the search term, or the search runs only in the frontend tasks.
