---
description: "recipe-data-table: TanStack Table v9, server sort and page, URL state"
tags: [obedience, frontend, regression]
max_turns: 40
timeout_seconds: 1200
allowed_tools: [Read, Glob, Grep, Skill, Write, Edit, Bash]
---

If a skill named `recipe-data-table` is available to you, invoke it with the Skill tool before you start. If it is not available, work without it.

The working directory is a store app: Next.js App Router, tRPC v11, TanStack Query v5, Drizzle and nuqs. The products page is `app/products/page.tsx`, and its code is in `features/products/`. `products.list({ q, sort, page })` returns `{ rows, total }` and sorts by `title` or `createdAt` on the server. The page has a shared nuqs parsers module.

Turn the products list into a data table with sortable headers and pagination.

Do not write or change tests.
