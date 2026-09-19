---
description: "recipe-tabs: URL tab, per-panel Suspense, hover prefetch"
tags: [obedience, frontend]
runs: 1
max_turns: 8
timeout_seconds: 420
allowed_tools: [Read, Glob, Grep, Skill]
---

If a skill named `recipe-tabs` is available to you, invoke it with the Skill tool before you answer. If it is not available, answer without it.

The app is Next.js App Router + tRPC v11 + TanStack Query v5 + Drizzle + shadcn/ui. The procedure `candidates.list({ tab: 'active' | 'archived' })` and `candidates.counts()` exist. The page uses nuqs.

Add Active and Archived tabs with count badges to the candidates page.

Do not write any file. Reply with the full code of every file you add or change.
