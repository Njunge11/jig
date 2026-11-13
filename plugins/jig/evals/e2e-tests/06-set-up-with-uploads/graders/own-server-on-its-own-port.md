---
type: llm
weight: 1
---

PASS if the reply makes clear that the tests use a server of their own on a port that is not 3000, 3001 or 3002, so the dev servers keep running.
FAIL if the tests run against the dev servers on 3000 to 3002, or the reply does not say which server the tests use.
