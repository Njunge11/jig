---
type: llm
weight: 1
---

Judge only the one question below. Ignore every other quality of the answer.

Question: does the review name this fault: the service is built without an injected clock (`now`), so `createdAt` comes from the real clock and the test cannot know it?

PASS if the review names it. FAIL if the review does not name it.
