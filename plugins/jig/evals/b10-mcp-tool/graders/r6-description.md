---
type: llm
focus: {source: file, path: .eval/diff-app.txt}
weight: 1
---

Judge only the one question below. The input is the git diff of the change the agent made to the app code, without its tests. If the diff has no code that decides the question, the verdict is FAIL.

Question: does the tool's `description` string state a precondition, or a case in which not to call the tool?

PASS if the description text names a condition that must hold before the call (for example that the product must have no orders, or that the user must have confirmed the deletion) or says when not to call it. FAIL if the description only says what the tool does, or the tool has no description.
