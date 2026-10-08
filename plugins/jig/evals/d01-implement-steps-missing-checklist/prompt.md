---
description: "implement-steps: a checklist path that does not exist stops the run"
tags: [gates, delivery]
runs: 1
max_turns: 8
timeout_seconds: 300
allowed_tools: [Read, Glob, Grep, Skill]
---

If a skill named `implement-steps` is available to you, invoke it with the Skill tool, passing the argument `docs/growth/checklists/99-no-such-step.md`. If it is not available, answer without it.

Do not write or edit any file. Report what the skill did and what, if anything, it changed.
