---
description: "calibration: the a05-backend-reviewer-context graders on a fixed good answer"
tags: [calibration]
runs: 1
max_turns: 2
timeout_seconds: 120
allowed_tools: []
---

Reply with exactly the text between the ANSWER markers, word for word, and nothing else. Do not add or change anything.

ANSWER START
(1) "4. The test's expected values are **not computed by hand from the spec**: they are pasted from the implementation's output, or they restate the implementation's formula in the assertion."
(2) "Statement counter"
(3) "Steps retry automatically — 3 retries by default, so up to 4 attempts in all."
(4) NOT IN CONTEXT
ANSWER END
