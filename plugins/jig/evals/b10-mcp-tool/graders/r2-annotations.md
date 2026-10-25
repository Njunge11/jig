---
type: llm
focus: {source: file, path: .eval/diff-app.txt}
weight: 1
---

Judge only the one question below. The input is the git diff of the change the agent made to the app code, without its tests. If the diff has no code that decides the question, the verdict is FAIL.

Question: do the tool's annotations set `destructiveHint: true` and leave `readOnlyHint` unset or `false`?

PASS if yes. FAIL if the annotations are absent, `destructiveHint` is not `true`, or `readOnlyHint` is `true`.
