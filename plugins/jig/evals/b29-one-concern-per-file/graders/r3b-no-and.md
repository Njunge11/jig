---
type: llm
focus: {source: file, path: .eval/diff-app.txt}
weight: 1
---

Judge only the one question below. The input is the git diff of the change the agent made to the app code, without its tests. If the diff has no code that decides the question, the verdict is FAIL.

Question: is the one-sentence comment at the top of each file the diff adds free of the word "and"?

PASS if each file the diff adds has a top comment and no such comment holds the word "and". FAIL if any added file's top comment holds the word "and", or no added file has a top comment.
