---
description: "recipe-page-with-data: prefetch + HydrateClient + useSuspenseQuery"
tags: [obedience, frontend, regression]
max_turns: 40
timeout_seconds: 1200
allowed_tools: [Read, Glob, Grep, Skill, Write, Edit, Bash]
---

If a skill named `recipe-page-with-data` is available to you, invoke it with the Skill tool before you start. If it is not available, work without it.

The working directory is a store app: Next.js App Router, tRPC v11, TanStack Query v5, Drizzle and nuqs. The products code is in `features/products/`. The procedure `products.byId({ id })` exists.

Build the product details page at `app/products/[id]/page.tsx`.
