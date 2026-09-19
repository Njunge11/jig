---
type: llm
weight: 2
---

PASS only if the review rejects the test and names at least four of these faults: it asserts that an internal function was called (`repo.insert` call count) and not the observable outcome; the expected total restates the implementation's formula and is not computed by hand from the spec (it must be the literal 13230); it mocks our own repo with `vi.fn` where a service test uses an in-memory fake repo; `toBeDefined()` is used where an exact value is knowable, and the clock is not injected; the name "works" does not state the action and the expected outcome; the test checks more than one behavior.

FAIL if the review accepts the test, or names fewer than four of these faults.
