---
type: llm
focus: {source: file, path: .eval/diff-app.txt}
weight: 1
---

Judge only the one question below. The input is the git diff of the documents the agent wrote: the implementation checklist, the tracker, and any change to the spec. If the diff has no checklist that decides the question, the verdict is FAIL.

Question: does the search, as the tasks state it, run over every active product of the store, rather than only the five products already shown?

PASS if a task states that the search matches across all active products of the store (for example "the five most recent active products that match", or a query with a WHERE clause over the store's active products). FAIL if the tasks narrow only the five fetched products, or never say which set the search covers.
