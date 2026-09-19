---
description: "recipe-data-table: v9, server sort and page, URL state"
tags: [obedience, frontend]
runs: 1
max_turns: 8
timeout_seconds: 420
allowed_tools: [Read, Glob, Grep, Skill]
---

If a skill named `recipe-data-table` is available to you, invoke it with the Skill tool before you answer. If it is not available, answer without it.

The app is Next.js App Router + tRPC v11 + TanStack Query v5 + Drizzle + shadcn/ui. `jobs.list({ q, sort, page })` returns `{ rows, total }` and sorts by `title` or `createdAt` on the server. The page has a shared nuqs parsers module.

Turn the jobs list into a data table with sortable headers and pagination.

Do not write any file. Reply with the full code of every file you add or change.
