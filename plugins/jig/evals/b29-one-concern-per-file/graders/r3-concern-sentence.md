---
type: llm
focus: {source: file, path: .eval/diff-app.txt}
weight: 1
---

Judge only the one question below. The input is the git diff of the change the agent made to the app code, without its tests. If the diff has no code that decides the question, the verdict is FAIL.

Question: does each file the diff adds have, at its top, a comment of one sentence that says what the file owns?

A first line that only gives the file's path does not count; look at the comment after it. A file the diff only changes (no `new file mode` entry) is not an added file. Do not judge the wording of the sentence; only whether it is there and is one sentence.

PASS if every added file has that comment. FAIL if an added file has none, or its top comment is more than one sentence.
