---
description: "backend-standards eve entry: module-scope execute, failures as values"
tags: [obedience, backend]
runs: 1
max_turns: 8
timeout_seconds: 420
allowed_tools: [Read, Glob, Grep, Skill]
---

If a skill named `backend-standards` is available to you, invoke it with the Skill tool before you answer. If it is not available, answer without it.

The app has an eve agent. Tools live in `agent/tools/`. `makeJobsService`, `makeJobsRepo`, `db`, `permittedCaller(ctx, authz, permission)` and `PERMISSIONS.JOBS_READ` exist.

Add a tool `get_job` that returns one job by id for the caller's company. A missing job and a caller without the permission are expected cases.

Do not write any file. Reply with the full code of every file you add or change.
