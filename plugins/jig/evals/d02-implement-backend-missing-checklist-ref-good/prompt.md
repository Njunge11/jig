---
description: "calibration: the d02-implement-backend-missing-checklist graders on a fixed good answer"
tags: [calibration]
runs: 1
max_turns: 2
timeout_seconds: 120
allowed_tools: []
---

Reply with exactly the text between the ANSWER markers, word for word, and nothing else. Do not add or change anything.

ANSWER START
The `implement-backend` skill opened `docs/growth/checklists/99-no-such-feature.md` first. That file does not exist. Its rule for a missing checklist says not to guess a path, so it looked for the row in `docs/growth/tracker.md`. That tracker does not exist, so no row names this checklist. The skill stopped and reports the missing file.

It loaded no standards skill and wrote nothing: no test, no code, no branch, no commit, no handoff, no tracker change and no PR. Nothing changed.
ANSWER END
