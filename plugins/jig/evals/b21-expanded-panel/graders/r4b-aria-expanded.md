---
type: llm
focus: {source: file, path: .eval/diff-app.txt}
weight: 1
---

Judge only the one question below. The input is the git diff of the change the agent made to the app code, without its tests. If the diff has no code that decides the question, the verdict is FAIL.

Question: Does the expand toggle button tell assistive technology whether the panel is expanded?

PASS if the toggle carries `aria-expanded` bound to the `expanded` state, or `aria-pressed` bound to it. FAIL if the toggle has neither, or carries a fixed value that does not change with the mode.
