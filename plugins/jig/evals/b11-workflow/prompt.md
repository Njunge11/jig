---
description: "backend-standards workflow entry: deterministic function, retry-safe steps"
tags: [obedience, backend]
runs: 1
max_turns: 8
timeout_seconds: 420
allowed_tools: [Read, Glob, Grep, Skill]
---

If a skill named `backend-standards` is available to you, invoke it with the Skill tool before you answer. If it is not available, answer without it.

The app uses the Workflow DevKit (`"use workflow"` / `"use step"`). `screening.score(applicationId)` calls an LLM and can hit a rate limit. `applications.saveScore(applicationId, score)` and `email.send(...)` exist.

Add a durable workflow `screen-application`: score the application, save the score, email the recruiter.

Do not write any file. Reply with the full code of every file you add or change.
