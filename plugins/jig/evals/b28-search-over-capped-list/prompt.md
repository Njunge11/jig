---
description: "recipe-search-and-filters: a search over a capped list still goes to the server"
tags: [obedience, frontend, regression]
max_turns: 40
timeout_seconds: 1200
allowed_tools: [Read, Glob, Grep, Skill, Write, Edit, Bash]
---

If a skill named `recipe-search-and-filters` is available to you, invoke it with the Skill tool before you start. If it is not available, work without it.

The working directory is a store app: Next.js App Router, tRPC v11, TanStack Query v5, Drizzle and shadcn/ui. The Home page, `app/page.tsx`, shows the store's 5 newest active products, each with its 5 newest orders and the customer of each order. `home.overview` reads them.

Add a search box to the Home page. It finds a product by its title or by a customer's name. The page shows only about 25 rows, so keep the change small.

Do not write or change tests.
