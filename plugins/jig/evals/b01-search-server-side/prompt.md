---
description: "recipe-search-and-filters: the server narrows, the URL owns q, the input debounces"
tags: [obedience, frontend, regression]
max_turns: 40
timeout_seconds: 1200
allowed_tools: [Read, Glob, Grep, Skill, Write, Edit, Bash]
---

If a skill named `recipe-search-and-filters` is available to you, invoke it with the Skill tool before you start. If it is not available, work without it.

The working directory is a store app: Next.js App Router, tRPC v11, TanStack Query v5, Drizzle and nuqs. A store can hold thousands of products. The products page is `app/products/page.tsx`, and its code is in `features/products/`.

Add a search box to the products page that finds products by title.
