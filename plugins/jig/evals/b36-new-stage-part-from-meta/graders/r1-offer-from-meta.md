---
type: llm
focus: {source: file, path: .eval/diff-app.txt}
weight: 1
---

Judge only the one question below. The input is the git diff of the change the agent made to the app code, without its tests. If the diff has no code that decides the question, the verdict is FAIL.

Question: does a state's `meta` name the review offer, and does the code show that offer only because the current state's meta names it?

PASS if yes. FAIL if the offer shows from a check of data beside the stored snapshot (`review === null`, a `has…` flag, a `useState`).
