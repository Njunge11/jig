---
description: "calibration: the b12-backend-test-review graders on a fixed good answer"
tags: [calibration]
runs: 1
max_turns: 2
timeout_seconds: 120
allowed_tools: []
---

Reply with exactly the text between the ANSWER markers, word for word, and nothing else. Do not add or change anything.

ANSWER START
**Reject.** The test fails six checks:

1. **It asserts an internal call.** `expect(repo.insert).toHaveBeenCalledTimes(1)` checks that the service called a repo function, not what the user observes. Assert the outcome instead: the returned invoice and the row the fake repo now holds.
2. **The expected total restates the implementation's formula.** `service.computeTotal(4900, 3, 10)` asks the code under test for its own answer, so a wrong formula still passes. Work the value out by hand from the spec and write it as a literal: 4900 × 3 seats = 14700, less 10% = `13230`.
3. **It mocks our own repo.** The repo is built from `vi.fn()` stubs. A service test runs on an in-memory fake repo (`invoices.repo.fake.ts`, proven by a contract test), and reads the stored rows back from it.
4. **`toBeDefined()` stands where an exact value is knowable.** `createdAt` is knowable once the clock is fixed; assert `toEqual(FIXED_DATE)`.
5. **The clock is not injected.** `makeInvoiceService({ repo })` gets no `now`, so the service reads the real clock and `createdAt` changes every run. Pass `now: () => FIXED_DATE`.
6. **The name "works" says nothing.** Name the action and the outcome: "creates an invoice for 3 pro seats with a 10% coupon at a total of 13230".

It also checks three behaviours in one test; split them after the fixes.
ANSWER END
