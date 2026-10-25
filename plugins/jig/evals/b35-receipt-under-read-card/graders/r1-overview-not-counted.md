---
type: llm
focus: {source: file, path: .eval/diff-app.txt}
weight: 1
---

Judge only the one question below. The input is the git diff of the change the agent made to the app code, without its tests. If the diff has no code that decides the question, the verdict is FAIL.

Question: when the screen picks the one card of an order that draws its receipt and offer (`lastCardOfEachOrder` or the code that replaces it), does the overview card still count?

PASS if the overview card cannot be picked. FAIL if it can still be picked.
