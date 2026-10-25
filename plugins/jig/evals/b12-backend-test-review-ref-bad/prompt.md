---
description: "calibration: the b12-backend-test-review graders on a fixed bad answer"
tags: [calibration]
runs: 1
max_turns: 2
timeout_seconds: 120
allowed_tools: []
---

Reply with exactly the text between the ANSWER markers, word for word, and nothing else. Do not add or change anything.

ANSWER START
**Accept.** The test is fine: it creates an invoice, checks the repo was called once, checks the total matches the service's own calculation, and checks a creation date was set. Mocking the repo with `vi.fn()` keeps it fast, and a short name like "works" is acceptable for a small test.
ANSWER END
