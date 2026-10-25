---
type: llm
focus: {source: file, path: .eval/diff-app.txt}
weight: 1
---

Judge only the one question below. The input is the git diff of the change the agent made to the app code, without its tests. If the diff has no code that decides the question, the verdict is FAIL.

Question: is the mode driven by one `expanded` boolean held in one place (one `useState`, or one URL param) that every part that changes reads?

PASS if yes. FAIL if the mode is decided by two or more flags combined, or the same state is kept in two components.
