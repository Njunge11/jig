---
description: "recipe-page-with-data: prefetch + HydrateClient + useSuspenseQuery"
tags: [obedience, frontend]
runs: 1
max_turns: 8
timeout_seconds: 420
allowed_tools: [Read, Glob, Grep, Skill]
---

If a skill named `recipe-page-with-data` is available to you, invoke it with the Skill tool before you answer. If it is not available, answer without it.

The app is Next.js App Router + tRPC v11 + TanStack Query v5 + Drizzle + shadcn/ui. The procedure `jobs.byId({ id })` exists and returns `{ id, title, status, applicants }`.

Build the job details page at `app/jobs/[id]/page.tsx` with its client part.

Do not write any file. Reply with the full code of every file you add or change.
