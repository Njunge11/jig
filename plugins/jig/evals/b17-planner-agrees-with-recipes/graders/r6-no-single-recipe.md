---
type: llm
focus: {source: file, path: .eval/diff-app.txt}
weight: 1
---

Judge only the one question below. The input is the git diff of the documents the agent wrote: the implementation checklist, the tracker, and any change to the spec. If the diff has no checklist that decides the question, the verdict is FAIL.

Question: does the checklist text avoid naming one single recipe as the recipe of the slice (for example "The recipe is `page-with-data`")?

PASS if yes: it names no single recipe as the answer for the slice. A note that lists each recipe that matches, or no recipe note at all, is a PASS. A sentence that cites a recipe as the source of one decision ("the search runs on the server, as `recipe-search-and-filters` says") does not name the slice's recipe and is a PASS. FAIL only if one recipe is named as the whole answer for the slice.
