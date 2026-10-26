---
type: llm
focus: {source: file, path: .eval/diff-app.txt}
weight: 1
---

Judge only the one question below. The input is the git diff of the documents the agent wrote: the implementation checklist, the tracker, and any change to the spec. If the diff has no checklist that decides the question, the verdict is FAIL.

Question: are all the tasks free of a browser-side filter, that is no task has the client keep, hide or filter rows of a list it already fetched?

PASS if yes: no task does. FAIL if any task describes a client-side filter over fetched rows.
