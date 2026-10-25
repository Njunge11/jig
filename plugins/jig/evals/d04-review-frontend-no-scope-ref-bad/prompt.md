---
description: "calibration: the d04-review-frontend-no-scope graders on a fixed bad answer"
tags: [calibration]
runs: 1
max_turns: 2
timeout_seconds: 120
allowed_tools: []
---

Reply with exactly the text between the ANSWER markers, word for word, and nothing else. Do not add or change anything.

ANSWER START
The `review-frontend-feature` skill reviewed the current diff against main.

recipes
 recipe-page-with-data applies — features/invites/ui/invites-page.tsx
 recipe-search-and-filters does not apply

frontend-standards Rules
 1 pass
 2 fail — features/invites/ui/member-picker.tsx:12 — imports Base UI; rebuild it on the kit's Popover + Command

frontend-tests
 1 pass
ANSWER END
