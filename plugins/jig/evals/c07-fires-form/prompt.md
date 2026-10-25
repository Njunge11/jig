---
description: "a form task fires the form recipe or the frontend standards"
tags: [triggering, regression]
max_turns: 4
timeout_seconds: 420
allowed_tools: [Read, Glob, Grep, Skill]
---

The app is Next.js App Router + tRPC v11 + TanStack Query v5 + Drizzle + shadcn/ui. The procedure `products.create` takes `{ title: string (3-120 chars), size: 'small'|'medium'|'large' }`. When the title is taken it throws a TRPCError whose cause carries `{ field: 'title', message: 'A product with this title exists' }`.

Build the create-product form.

Do not write any file. Reply with the full code of every file you add or change.
