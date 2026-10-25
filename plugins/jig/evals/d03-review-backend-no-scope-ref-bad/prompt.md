---
description: "calibration: the d03-review-backend-no-scope graders on a fixed bad answer"
tags: [calibration]
runs: 1
max_turns: 2
timeout_seconds: 120
allowed_tools: []
---

Reply with exactly the text between the ANSWER markers, word for word, and nothing else. Do not add or change anything.

ANSWER START
The `review-backend-feature` skill reviewed the current diff against main.

backend-standards
 1 pass
 2 pass
 3 fail — src/features/invites/api/invites.router.ts:41 — the router runs a query; move it into invites.service.ts

backend-tests
 1 pass
 2 pass

structure
 features/invites/api/invites.service.ts pass
ANSWER END
