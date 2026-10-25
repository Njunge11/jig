---
type: llm
focus: {source: file, path: .eval/diff-app.txt}
weight: 1
---

Judge only the one question below. The input is the git diff of the change the agent made to the app code, without its tests. If the diff has no code that decides the question, the verdict is FAIL.

Question: is the description editor component rendered at exactly one place in the JSX, under the same parent elements in both modes, so React keeps it mounted when the mode toggles?

PASS if yes. FAIL if the expanded mode renders the editor in a second place (another branch of a conditional, a portal, a dialog, a second tree), or the toggle swaps the element type or `key` of an element that wraps it.
