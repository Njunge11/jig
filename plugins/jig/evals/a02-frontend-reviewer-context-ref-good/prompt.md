---
description: "calibration: the a02-frontend-reviewer-context graders on a fixed good answer"
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
(3) "No recipe is preloaded: walk the frontend-standards catalog against the diff, record `applies` or `does not apply` for every row — never a silent skip — and invoke the recipe skill of each row that applies, so its Verify list joins the rubric."
(4) NOT IN CONTEXT
ANSWER END
