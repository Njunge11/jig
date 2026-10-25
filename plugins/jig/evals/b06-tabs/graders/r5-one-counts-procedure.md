---
type: llm
focus: {source: file, path: .eval/diff-app.txt}
weight: 1
---

Judge only the one question below. The input is the git diff of the change the agent made to the app code, without its tests. If the diff has no code that decides the question, the verdict is FAIL.

Question: Do the badge counts come from the `orders.counts` procedure?

PASS if the badges read their numbers from a query of `orders.counts`. FAIL if a badge count comes from the length of a fetched list or another count source.
