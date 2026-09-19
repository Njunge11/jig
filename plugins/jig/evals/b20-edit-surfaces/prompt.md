---
description: "recipe-edit-surfaces: dialog from a menu, dirty guard, verb on the confirm"
tags: [obedience, frontend]
runs: 1
max_turns: 8
timeout_seconds: 420
allowed_tools: [Read, Glob, Grep, Skill]
---

If a skill named `recipe-edit-surfaces` is available to you, invoke it with the Skill tool before you answer. If it is not available, answer without it.

The app is Next.js App Router + tRPC v11 + TanStack Query v5 + Drizzle + shadcn/ui. Each row of the jobs table has a `DropdownMenu`. `jobs.rename({ id, title })`, `jobs.delete({ id })` and `jobs.byId({ id })` exist.

Add two menu actions: "Rename" (one field: the title) and "Delete" (with a confirm). Deleting a job also removes its applications.

Do not write any file. Reply with the full code of every file you add or change.
