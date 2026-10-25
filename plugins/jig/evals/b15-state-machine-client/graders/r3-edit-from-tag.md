---
type: llm
focus: {source: file, path: .eval/diff-app.txt}
weight: 1
---

Judge only the one question below. The input is the git diff of the change the agent made to the app code, without its tests. If the diff has no code that decides the question, the verdict is FAIL.

Question: is whether the Edit button shows decided by `hasTag("editable")` on the resolved snapshot, with no check of state names?

PASS if yes. FAIL if the Edit button's condition compares state names (`value === "collecting"`, `matches("collecting") || matches("reviewing")`) or reads a list of editable states.
