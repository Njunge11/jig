---
type: llm
focus: {source: file, path: .eval/diff-app.txt}
weight: 1
---

Judge only the one question below. The input is the git diff of the change the agent made to the app code, without its tests. If the diff has no code that decides the question, the verdict is FAIL.

In the app before the change, `RichTextEditor`'s `onValueChange` already hands the form the editor state JSON (`JSON.stringify(editorState.toJSON())`), and the editor restores from `defaultValue`, which the form fills from the stored description. A save that stores the form's `description` value as it is stores that JSON.

Question: on save, is the stored description the serialized Lexical editor state (`editorState.toJSON()` or `JSON.stringify` of it), restored into the editor from that JSON?

PASS if yes. Extra HTML or markdown derived at save time for render-only consumers is fine. FAIL if HTML or markdown is the stored source that is imported back into the editor.
