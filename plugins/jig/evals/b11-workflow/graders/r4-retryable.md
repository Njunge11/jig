---
type: llm
focus: {source: file, path: .eval/diff-app.txt}
weight: 1
---

Judge only the one question below. The input is the git diff of the change the agent made to the app code, without its tests. If the diff has no code that decides the question, the verdict is FAIL.

Question: when `fraud.score` throws `RateLimitError`, does the step throw `RetryableError` with a `retryAfter` option?

PASS if yes; the delay may come from the error's `retryAfterMs` or be a fixed duration. FAIL if a rate limit is rethrown unclassified, swallowed, or thrown as `RetryableError` without `retryAfter`.
