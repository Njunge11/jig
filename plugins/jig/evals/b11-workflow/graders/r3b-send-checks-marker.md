---
type: llm
focus: {source: file, path: .eval/diff-app.txt}
weight: 1
---

Judge only the one question below. The input is the git diff of the change the agent made to the app code, without its tests. If the diff has no code that decides the question, the verdict is FAIL.

Question: does the step that sends the email call the notifications service's `wasSent(key)` before `email.send` and return without sending when it answers true, and call its `markSent(key)` after the send?

PASS if both: the check before the send and the marker after it. FAIL if the send runs without the `wasSent` check, or `markSent` is missing or runs before the send.
