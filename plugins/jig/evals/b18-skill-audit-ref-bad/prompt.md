---
description: "calibration: the b18-skill-audit graders on a fixed bad answer"
tags: [calibration]
runs: 1
max_turns: 2
timeout_seconds: 120
allowed_tools: []
---

Reply with exactly the text between the ANSWER markers, word for word, and nothing else. Do not add or change anything.

ANSWER START
Item 1 — pass — the folder and file names are correct.
Item 4 — pass — the description has triggers.
Item 6 — pass — SKILL.md:40 links `references/rollback.md`, which is correct progressive disclosure: the rollback details load only when a rollback runs, which keeps SKILL.md short.
Item 15 — pass — `release-engineer` preloads the skill.

Required change: make the pointer at SKILL.md:40 stronger: "Always read references/rollback.md before any rollback."
ANSWER END
