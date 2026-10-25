---
type: llm
focus: {source: file, path: .eval/diff-app.txt}
weight: 1
---

Judge only the one question below. The input is the git diff of the change the agent made to the app code, without its tests. If the diff has no code that decides the question, the verdict is FAIL.

Before the change, `home.overview` takes no input. Its repo reads the store's 5 newest active products (a LIMIT of 5), then the 5 newest orders of each of those products, with each order's customer name.

Question: does the server search every active product of the store, by product title or by a customer's name, before the cap of 5 products applies?

PASS if `home.overview` (or a new procedure) takes the term in its input and the SQL filters the active products by title or by a matching customer name (a join, `EXISTS` or subquery) in the WHERE clause, before the LIMIT of 5 products. FAIL if the server still selects the newest 5 products first and the term is matched only against those rows, or the term never reaches the server.
