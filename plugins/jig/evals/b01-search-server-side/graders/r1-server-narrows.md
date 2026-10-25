---
type: llm
focus: {source: file, path: .eval/diff-app.txt}
weight: 1
---

Judge only the one question below. The input is the git diff of the change the agent made to the app code, without its tests. If the diff has no code that decides the question, the verdict is FAIL.

Question: Does the `products.list` procedure take the search term in its input and narrow the rows in SQL?

PASS if the procedure's input schema holds the term and the repository query adds a WHERE condition on the product title with that term (`ilike`, `like`, or a full-text match). FAIL if the server still returns every product of the store and the term never reaches the SQL.
