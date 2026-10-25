---
type: llm
weight: 1
---

Judge only the one question below. Ignore every other quality of the answer.

Question: does the review reject the test and give, as a reason, that the test mocks the component's own data hook (`useSuspenseQuery` through `vi.mock("@tanstack/react-query")`)?

PASS if it rejects the test and names that hook mock as a reason. FAIL if it accepts the test, or rejects it without naming the hook mock.
