---
description: "recipe-form-with-mutation: one schema, field errors, no double submit"
tags: [obedience, frontend, regression]
max_turns: 40
timeout_seconds: 1200
allowed_tools: [Read, Glob, Grep, Skill, Write, Edit, Bash]
---

If a skill named `recipe-form-with-mutation` is available to you, invoke it with the Skill tool before you start. If it is not available, work without it.

The working directory is a store app: Next.js App Router, tRPC v11, TanStack Query v5, Drizzle and nuqs. The products page is `app/products/page.tsx`, and its code is in `features/products/`. The procedure `products.create` exists. When the title is taken, it throws a TRPCError whose cause carries `{ field: 'title', message: 'A product with this title exists' }`.

Add a form to the products page that creates a product.
