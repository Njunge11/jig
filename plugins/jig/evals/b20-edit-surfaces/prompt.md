---
description: "recipe-edit-surfaces: dialog outside the menu, dirty backdrop, destructive confirm"
tags: [obedience, frontend, regression]
max_turns: 40
timeout_seconds: 1200
allowed_tools: [Read, Glob, Grep, Skill, Write, Edit, Bash]
---

If a skill named `recipe-edit-surfaces` is available to you, invoke it with the Skill tool before you start. If it is not available, work without it.

The working directory is a store app: Next.js App Router, tRPC v11, TanStack Query v5, Drizzle and nuqs. The products page is `app/products/page.tsx`, and its code is in `features/products/`. Each row of the products table shows a product's title and has a `DropdownMenu`. `products.update({ id, title, brand })`, `products.delete({ id })` and `products.byId({ id })` (returns `{ id, title, brand }`) exist; `products.list` feeds the table.

Add two menu actions: "Edit details" (two fields: the title and the brand) and "Delete" (with a confirm). Deleting a product also removes its reviews.

Do not write or change tests.
