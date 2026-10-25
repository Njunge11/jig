---
type: llm
focus: {source: file, path: .eval/diff-app.txt}
weight: 1
---

Judge only the one question below. The input is the git diff of the change the agent made to the app code, without its tests. If the diff has no code that decides the question, the verdict is FAIL.

Question: Does the table render the server's rows as returned, with no sorting or paging in the browser?

PASS if `features` registers no `sortedRowModel` or `paginatedRowModel` (`createSortedRowModel`, `createPaginatedRowModel`) and no client code sorts or slices the rows; a registered `rowSortingFeature` or `rowPaginationFeature` sets `manualSorting` or `manualPagination` with `rowCount`. FAIL if the browser sorts or pages the rows.
