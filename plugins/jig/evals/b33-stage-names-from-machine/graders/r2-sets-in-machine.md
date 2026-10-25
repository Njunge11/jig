---
type: llm
focus: {source: file, path: .eval/diff-app.txt}
weight: 1
---

Judge only the one question below. The input is the git diff of the change the agent made to the app code, without its tests. If the diff has no code that decides the question, the verdict is FAIL.

Question: does the machine itself mark which stages the orders page lists, with a tag or a `meta` field on those state nodes?

PASS if the diff adds a tag or a `meta` field to the state configs of the listed stages, and the page's set of stages is read from it. FAIL if the set of stages the page lists is decided only outside the machine.
