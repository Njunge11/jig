---
type: llm
focus: {source: file, path: .eval/diff-app.txt}
weight: 1
---

Judge only the one question below. The input is the git diff of the change the agent made to the app code, without its tests. If the diff has no code that decides the question, the verdict is FAIL.

Question: when `fraud.score` throws `OrderNotFoundError`, does the step throw `FatalError`?

PASS if yes. FAIL if that error is rethrown unclassified, thrown as `RetryableError`, or swallowed.
