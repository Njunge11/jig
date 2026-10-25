---
type: llm
focus: {source: file, path: .eval/diff-app.txt}
weight: 1
---

Judge only the one question below. The input is the git diff of the change the agent made to the app code, without its tests. If the diff has no code that decides the question, the verdict is FAIL.

Question: does pressing Escape while the panel is expanded collapse it?

PASS if code handles the Escape key (a `keydown` listener or an `onKeyDown` handler checking `"Escape"`) and sets the mode back to collapsed. FAIL if Escape is not handled.
