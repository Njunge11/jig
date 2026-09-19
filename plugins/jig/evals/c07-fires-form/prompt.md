---
description: "a form task fires the form recipe or the frontend standards"
tags: [triggering]
runs: 1
max_turns: 4
timeout_seconds: 420
allowed_tools: [Read, Glob, Grep, Skill]
---

The app is Next.js App Router + tRPC v11 + TanStack Query v5 + Drizzle + shadcn/ui. The procedure `jobs.create` takes `{ title: string (3-120 chars), seniority: 'junior'|'mid'|'senior' }`. When the title is taken it throws a TRPCError whose cause carries `{ field: 'title', message: 'A job with this title exists' }`.

Build the create-job form.

Do not write any file. Reply with the full code of every file you add or change.
