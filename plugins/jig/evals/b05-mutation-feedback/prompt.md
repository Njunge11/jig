---
description: "recipe-mutation-feedback: the optimistic order and undo"
tags: [obedience, frontend]
runs: 1
max_turns: 8
timeout_seconds: 420
allowed_tools: [Read, Glob, Grep, Skill]
---

If a skill named `recipe-mutation-feedback` is available to you, invoke it with the Skill tool before you answer. If it is not available, answer without it.

The app is Next.js App Router + tRPC v11 + TanStack Query v5 + Drizzle + shadcn/ui. The procedures `jobs.archive({ id })` and `jobs.unarchive({ id })` exist. The jobs list and a sidebar counter both read `jobs.list`, and both must show the change at once.

Add an Archive button to a job row, with an Undo.

Do not write any file. Reply with the full code of every file you add or change.
