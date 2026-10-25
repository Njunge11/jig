---
type: llm
focus: {source: file, path: .eval/diff-app.txt}
weight: 1
---

Judge only the one question below. The input is the git diff of the change the agent made to the app code, without its tests. If the diff has no code that decides the question, the verdict is FAIL.

Question: Is the pagination built from the kit's `Pagination` components?

PASS if it uses the kit's `Pagination`, `PaginationContent`, `PaginationItem` and its link or previous/next parts. FAIL if the pagination is hand-made buttons or another custom control.
