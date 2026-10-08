---
description: "review-frontend-feature: no checklist or branch means no verdicts"
tags: [gates, review]
runs: 1
max_turns: 8
timeout_seconds: 300
allowed_tools: [Read, Glob, Grep, Skill]
---

If a skill named `review-frontend-feature` is available to you, invoke it with the Skill tool with no arguments. If it is not available, answer without it.

Do not write or edit any file. Report the per-item verdicts the skill returned, or the reason it gave for returning none.
