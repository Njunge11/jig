---
description: "recipe-mutation-feedback: an optimistic checkbox stays enabled and bright while it saves"
tags: [obedience, frontend, regression]
max_turns: 40
timeout_seconds: 1200
allowed_tools: [Read, Glob, Grep, Skill, Write, Edit, Bash]
---

If a skill named `recipe-mutation-feedback` is available to you, invoke it with the Skill tool before you start. If it is not available, work without it.

The working directory is a store app: Next.js App Router, tRPC v11, TanStack Query v5, Drizzle and nuqs. The products page is `app/products/page.tsx`, and its code is in `features/products/`. The procedure `products.setFeatured({ id, featured })` exists, and `products.list` returns each product's `featured` value.

Add a Featured checkbox to each product row. A click saves it at once, and it must feel instant.

Do not write or change tests.
