---
type: llm
focus: {source: file, path: .eval/diff-app.txt}
weight: 1
---

Judge only the one question below. The input is the git diff of the change the agent made to the app code, without its tests. If the diff has no code that decides the question, the verdict is FAIL.

Question: does the code give the layout a deliberate behavior below the `lg` breakpoint, through breakpoint-prefixed classes (`lg:`, `max-lg:`, or a smaller breakpoint)?

PASS if yes. FAIL if the layout and toggle have no breakpoint-prefixed classes, so small screens get whatever the desktop layout does.
