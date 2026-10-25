---
description: "recipe-search-and-filters step 4: hold the old list with useDeferredValue"
tags: [obedience, frontend, regression]
max_turns: 40
timeout_seconds: 1200
allowed_tools: [Read, Glob, Grep, Skill, Write, Edit, Bash]
---

If a skill named `recipe-search-and-filters` is available to you, invoke it with the Skill tool before you start. If it is not available, work without it.

The working directory is a store app: Next.js App Router, tRPC v11, TanStack Query v5, Drizzle and nuqs. The products page is `app/products/page.tsx`, and its code is in `features/products/`. The route has a `loading.tsx` with a full-page skeleton.

Bug: each time the user searches the products list, the whole page falls to the skeleton until the new result arrives. The old list must stay on screen, dimmed, while the new result loads. Fix it.

Do not write or change tests.
