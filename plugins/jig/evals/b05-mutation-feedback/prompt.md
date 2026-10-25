---
description: "recipe-mutation-feedback: the optimistic order and undo"
tags: [obedience, frontend, regression]
max_turns: 40
timeout_seconds: 1200
allowed_tools: [Read, Glob, Grep, Skill, Write, Edit, Bash]
---

If a skill named `recipe-mutation-feedback` is available to you, invoke it with the Skill tool before you start. If it is not available, work without it.

The working directory is a store app: Next.js App Router, tRPC v11, TanStack Query v5, Drizzle and nuqs. The products page is `app/products/page.tsx`, and its code is in `features/products/`. The procedures `products.archive({ id })` and `products.unarchive({ id })` exist. The products list and the sidebar counter both read `products.list`, and both must show the change at once.

Add an Archive button to each product row, with an Undo.

Do not write or change tests.
