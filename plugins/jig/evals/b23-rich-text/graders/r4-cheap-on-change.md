---
type: llm
focus: {source: file, path: .eval/diff-app.txt}
weight: 1
---

Judge only the one question below. The input is the git diff of the change the agent made to the app code, without its tests.

Question: does any code in the diff run `$convertToMarkdownString` or `$generateHtmlFromNodes` inside the editor's change listener (`OnChangePlugin`'s `onChange`, an `onValueChange`, or an `editor.registerUpdateListener` callback), so the whole document is exported on each change?

PASS if no code does. An export that runs once in a click handler, at stream start, or at save time is fine, and so is a listener that keeps only the editor state or its JSON. FAIL if a change listener runs either export.
