---
description: "skill-audit: a rule in references/ fails item 6"
tags: [obedience, meta]
runs: 1
max_turns: 8
timeout_seconds: 420
allowed_tools: [Read, Glob, Grep, Skill]
---

If a skill named `skill-audit` is available to you, invoke it with the Skill tool before you answer. If it is not available, answer without it.

Audit this skill folder against the audit checklist and say which items fail.

```
deploy-checks/
  SKILL.md        (180 lines)
  references/rollback.md
```
SKILL.md, line 40: "**Load `references/rollback.md` before you roll back.** It holds the rollback rules."
references/rollback.md: "- Never roll back a migration that dropped a column. - You must snapshot the database first. - Roll back one release at a time."

Do not write any file.
