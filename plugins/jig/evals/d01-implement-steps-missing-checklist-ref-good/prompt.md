---
description: "calibration: the d01-implement-steps-missing-checklist graders on a fixed good answer"
tags: [calibration]
runs: 1
max_turns: 2
timeout_seconds: 120
allowed_tools: []
---

Reply with exactly the text between the ANSWER markers, word for word, and nothing else. Do not add or change anything.

ANSWER START
The `implement-steps` skill opened `docs/growth/checklists/99-no-such-step.md` first. That file does not exist. The skill's rule for a missing checklist says not to guess a path, so it looked for the checklist's row in `docs/growth/tracker.md`. That tracker does not exist either, so no row names this checklist. The skill stopped there and reports the missing file.

It loaded no standards skill, created no branch, ran no baseline, executed no step, made no commit and opened no PR. Nothing changed.
ANSWER END
