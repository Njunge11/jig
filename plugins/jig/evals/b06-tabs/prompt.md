---
description: "recipe-tabs: URL tab, per-panel Suspense, hover prefetch"
tags: [obedience, frontend, regression]
max_turns: 40
timeout_seconds: 1200
allowed_tools: [Read, Glob, Grep, Skill, Write, Edit, Bash]
---

If a skill named `recipe-tabs` is available to you, invoke it with the Skill tool before you start. If it is not available, work without it.

The working directory is a store app: Next.js App Router, tRPC v11, TanStack Query v5, Drizzle and nuqs. The orders page is `app/orders/page.tsx`, and its code is in `features/orders/`. The procedures `orders.list({ tab: 'active' | 'archived' })` and `orders.counts()` exist.

Add Active and Archived tabs with count badges to the orders page.

Do not write or change tests.
