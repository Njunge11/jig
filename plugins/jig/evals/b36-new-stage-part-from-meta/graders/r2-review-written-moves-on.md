---
type: llm
focus: {source: file, path: .eval/diff-app.txt}
weight: 1
---

Judge only the one question below. The input is the git diff of the change the agent made to the app code, without its tests. If the diff has no code that decides the question, the verdict is FAIL.

Question: is there an event that moves the order from the state whose meta names the review offer to a state whose meta names no such offer?

PASS if yes. FAIL if not.
