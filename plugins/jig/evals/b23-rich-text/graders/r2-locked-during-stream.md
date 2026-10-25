---
type: llm
focus: {source: file, path: .eval/diff-app.txt}
weight: 1
---

Judge only the one question below. The input is the git diff of the change the agent made to the app code, without its tests. If the diff has no code that decides the question, the verdict is FAIL.

Question: while the stream runs, is the user kept from typing into the editor?

PASS if the code makes the editor non-editable for the stream (`editor.setEditable(false)`, or the editable surface is replaced by a read-only view of the stream) and makes it editable again when the stream ends. FAIL if the editor stays editable while the stream runs.
