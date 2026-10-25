---
type: llm
focus: {source: file, path: .eval/diff-app.txt}
weight: 1
---

Judge only the one question below. The input is the git diff of the change the agent made to the app code, without its tests. If the diff has no code that decides the question, the verdict is FAIL.

Question: does `email.send` run outside the transaction callback?

PASS if `email.send` is called after the transaction has resolved, or an outbox row is written inside the transaction and the diff includes the step that sends that row. FAIL if `email.send` is called inside the transaction callback, an outbox row is written with no code that sends it, or the code never sends the email.
