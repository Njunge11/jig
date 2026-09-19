---
type: llm
weight: 2
---

PASS only if: the workflow function (`"use workflow"`) lives in `index.ts`, only orchestrates steps and branches on their results, and does no I/O, clock, randomness or service call itself; the steps (`"use step"`) live in a separate `steps.ts` and are the place that calls the services; each step checks if its work is already done before it does it (a retried step runs again from the top); a rate limit throws `RetryableError` with `retryAfter` and a failure with no recovery throws `FatalError`.

FAIL if the workflow function calls a service or the network directly, or if no step is safe to retry.
