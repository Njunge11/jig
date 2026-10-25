---
type: llm
focus: {source: file, path: .eval/diff-app.txt}
weight: 1
---

Judge only the one question below. The input is the git diff of the change the agent made to the app code, without its tests. If the diff has no code that decides the question, the verdict is FAIL.

Question: does the expand toggle button have an accessible name (an `aria-label`, or visible text) that says what it does?

PASS if yes. FAIL if the toggle is an icon-only button with no `aria-label`.
