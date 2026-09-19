---
type: llm
weight: 1
---

Judge only the one point below. Ignore every other quality of the answer. Do not fail the answer for a fault that this point does not name.

PASS if the editor's change listener (`onChange` / `OnChangePlugin` / `onValueChange`) keeps only the editor state or its JSON. An export to markdown or HTML that runs one time in a click handler or at save time is correct. FAIL only if `$convertToMarkdownString` or `$generateHtmlFromNodes` runs inside the change listener on each keystroke.
