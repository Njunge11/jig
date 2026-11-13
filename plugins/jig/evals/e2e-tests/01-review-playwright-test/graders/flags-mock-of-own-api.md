---
type: llm
weight: 1
---

PASS if the review says that the test fakes the app's own API answer (the `page.route` / `route.fulfill` call on `team.invite`), so the real backend is not tested.
FAIL if the review does not name this, or accepts the mock.
