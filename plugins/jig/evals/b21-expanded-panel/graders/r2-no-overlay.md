---
type: llm
focus: {source: file, path: .eval/diff-app.txt}
weight: 1
---

Judge only the one question below. The input is the git diff of the change the agent made to the app code, without its tests. If the diff has no code that decides the question, the verdict is FAIL.

Question: does the expanded mode avoid a portal, `position: fixed` (a `fixed` class or style), and an overlay layer, so that only layout classes on the existing containers change?

PASS if yes. FAIL if the expanded mode uses a portal, `position: fixed`, a `Dialog` / `Sheet`, or an overlay layer.
