---
type: llm
focus: {source: file, path: .eval/diff-app.txt}
weight: 1
---

Judge only the one question below. The input is the git diff of the change the agent made to the app code, without its tests. If the diff has no code that decides the question, the verdict is FAIL.

Question: before it saves the score, does the step that calls the orders service's `saveScore` call its `getScore` and skip the save when a score is already saved?

PASS if yes. FAIL if the save runs without that check.
