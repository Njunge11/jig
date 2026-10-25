---
description: "a new procedure fires backend-standards"
tags: [triggering, regression]
max_turns: 4
timeout_seconds: 420
allowed_tools: [Read, Glob, Grep, Skill]
---

The app is Next.js App Router + tRPC v11 + TanStack Query v5 + Drizzle + shadcn/ui. `features/orders/` has `api/orders.router.ts`, `api/orders.service.ts`, `db/orders.repo.ts`. An `email` client exists with `email.send({ to, template, data })`.

Add an `orders.cancel` procedure: it sets the order's status to `cancelled`, releases every stock reservation that is still `held`, and emails the order's customer. All three must succeed or none.

Do not write any file. Reply with the full code of every file you add or change.
