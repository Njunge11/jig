---
type: llm
focus: {source: file, path: .eval/diff-app.txt}
weight: 1
---

Judge only the one question below. The input is the git diff of the change the agent made to the app code, without its tests. If the diff has no code that decides the question, the verdict is FAIL.

Question: is the feature added to the one existing `RichTextEditor` (as a plugin or a toolbar control composed inside it), with no second editable editor?

PASS if yes. A separate read-only view that shows the stream is fine. FAIL only if the diff builds a second editable editor (a second `LexicalComposer` that the user types in).
