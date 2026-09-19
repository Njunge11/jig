---
description: "a new procedure fires backend-standards"
tags: [triggering]
runs: 1
max_turns: 4
timeout_seconds: 420
allowed_tools: [Read, Glob, Grep, Skill]
---

The app is Next.js App Router + tRPC v11 + TanStack Query v5 + Drizzle + shadcn/ui. `features/jobs/` has `api/jobs.router.ts`, `api/jobs.service.ts`, `db/jobs.repo.ts`. An `email` client exists with `email.send({ to, template, data })`.

Add a `jobs.close` procedure: it sets the job's status to `closed`, rejects every application that is still `new`, and emails the job's owner. All three must succeed or none.

Do not write any file. Reply with the full code of every file you add or change.
