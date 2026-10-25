---
type: llm
focus: {source: file, path: .eval/diff-app.txt}
weight: 1
---

Judge only the one question below. The input is the git diff of the change the agent made to the app code, without its tests. If the diff has no code that decides the question, the verdict is FAIL.

Question: does each message iterate its `parts` and render each part by looking its type up in one map from part type to card, so the transcript has no `part.type ===` branch or `switch` on `part.type` and an unknown part type renders nothing?

PASS if yes. A `part.type` check inside a card's own module is fine. FAIL if the transcript branches on `part.type` (`===`, `switch`), renders a message as one string, or renders something for an unknown part type.
