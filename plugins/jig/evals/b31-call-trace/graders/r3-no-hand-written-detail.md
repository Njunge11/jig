---
type: llm
weight: 1
---

Judge only the one point below. Ignore every other quality of the answer. Do not fail the answer for a fault that this point does not name.

Look only at the first argument of each `trace(...)` and `traceBlock(...)` call in the answer's source files, and at what the repo wraps. PASS if none of those line strings contains an id value, an email address or user-written text, none of them contains the words `success` or `failed` (the helper reads the result off the call), and no repo wraps a Drizzle statement in `trace` or `traceQuery` by hand (the client traces queries). FAIL on any of those three. A `log.warn(...)` of a failure with an id is not a trace line and does not fail this point; a test's expected regex that contains `success` does not fail this point; a `describe` callback on the root that maps the middleware's `{ ok, error }` result to `success` or `failed: <message>` is the prescribed way to read a result that never throws, and does not fail this point.
