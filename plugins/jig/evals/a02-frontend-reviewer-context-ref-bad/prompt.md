---
description: "calibration: the a02-frontend-reviewer-context graders on a fixed bad answer"
tags: [calibration]
runs: 1
max_turns: 2
timeout_seconds: 120
allowed_tools: []
---

Reply with exactly the text between the ANSWER markers, word for word, and nothing else. Do not add or change anything.

ANSWER START
(1) "3. One primitive library: Radix. Do not introduce a second (Base UI, Headless UI, React Aria)."
(2) "1. The test asserts **React state, hooks, or refs** instead of what is on screen."
(3) "does not apply"
(4) "Narrowing happens in the list procedure; the client sends input, never post-filters."
ANSWER END
