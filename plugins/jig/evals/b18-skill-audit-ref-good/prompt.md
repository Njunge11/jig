---
description: "calibration: the b18-skill-audit graders on a fixed good answer"
tags: [calibration]
runs: 1
max_turns: 2
timeout_seconds: 120
allowed_tools: []
---

Reply with exactly the text between the ANSWER markers, word for word, and nothing else. Do not add or change anything.

ANSWER START
Category: **Workflow automation** — SKILL.md:3 — the skill drives the checks of a multi-step deploy and rollback.

Item 1 — pass — `deploy-checks/` is kebab-case, `SKILL.md` spelled exactly, no README.md.
Item 2 — pass — `references/` holds one markdown file.
Item 3 — pass — SKILL.md:2 — `name: deploy-checks` matches the folder.
Item 4 — pass — SKILL.md:3 — the description says what and when, with "deploy" and "roll back" triggers, under 1024 characters.
Item 5 — pass — SKILL.md:3 — both triggers name the deploy domain.
Item 6 — fail — references/rollback.md:3-5 — the file holds three rules a run must obey: "Never roll back a migration that dropped a column", "You must snapshot the database before you roll back", and "Roll back one release at a time". A file under `references/` reaches the agent only when the agent chooses to read it, and the `skills:` preload of `release-engineer` injects only `SKILL.md`. So a rollback run can miss all three rules. Required change: move the three rules into the `SKILL.md` body, in the rollback section at line 40. Keep in `references/rollback.md` only the help: the ten kept releases and where the dashboard shows them. Change the line 40 link to say what the file holds, not that it holds the rollback rules.
Item 7 — pass — the critical checks sit at the top of SKILL.md.
Item 8 — pass — the rollback rules name exact conditions to check.
Item 9 — pass — the files hold one home per rule.
Item 10 — pass — the body shows the checks to run.
Item 11 — pass — the rules stay inside deploys.
Item 13 — pass — the checks run in order before and after the deploy.
Item 15 — pass — `release-engineer` lists `deploy-checks` under `skills:`, a real loading path. After the move, the rules load with it.

Item 16 — pass — the description triggers on deploy and rollback requests, not on unrelated ones.

Final verdict: one failure, item 6. Fix it by moving the three rules into SKILL.md.
ANSWER END
