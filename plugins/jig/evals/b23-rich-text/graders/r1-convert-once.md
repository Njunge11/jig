---
type: llm
focus: {source: file, path: .eval/diff-app.txt}
weight: 1
---

Judge only the one question below. The input is the git diff of the change the agent made to the app code, without its tests. If the diff has no code that decides the question, the verdict is FAIL.

Question: is `$convertFromMarkdownString` run into the editor once, after the stream completes, rather than on each chunk?

PASS if the code converts the full streamed markdown into the editor one time, when the stream ends. FAIL if it converts the accumulated markdown on each chunk or tick (inside the stream loop, or in an effect that reruns as the text grows), or never puts the result into the editor.
