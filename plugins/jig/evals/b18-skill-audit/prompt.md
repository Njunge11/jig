---
description: "skill-audit: a rule in references/ fails item 6"
tags: [obedience, meta]
runs: 1
max_turns: 8
timeout_seconds: 420
allowed_tools: [Read, Glob, Grep, Skill]
---

If a skill named `skill-audit` is available to you, invoke it with the Skill tool before you answer. If it is not available, answer without it.

Audit this skill. Give a verdict per finding and the change you require.

```
deploy-checks/
  SKILL.md              (180 lines)
  references/rollback.md (45 lines)
```

`SKILL.md` frontmatter: `name: deploy-checks`, `description: Checks to run before and after a deploy. Use when you deploy or roll back a release.` The agent `release-engineer` lists `deploy-checks` under `skills:`.

`SKILL.md`, line 40: "For a rollback, see [`references/rollback.md`](references/rollback.md)."

`references/rollback.md`, in full:
"# Rollback
A rollback returns production to the last good release. The platform keeps ten releases.
- Never roll back a migration that dropped a column.
- You must snapshot the database before you roll back.
- Roll back one release at a time.
The dashboard shows each release under Deployments."

Do not write any file.
