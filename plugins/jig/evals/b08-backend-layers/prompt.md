---
description: "backend-standards: router is glue, the service owns the transaction, the repo owns the queries"
tags: [obedience, backend, regression]
max_turns: 40
timeout_seconds: 1200
allowed_tools: [Read, Glob, Grep, Skill, Write, Edit, Bash]
---

If a skill named `backend-standards` is available to you, invoke it with the Skill tool before you start. If it is not available, work without it.

The working directory is a store app: Next.js App Router, tRPC v11, TanStack Query v5, Drizzle and nuqs. `features/orders/` has `api/orders.router.ts`, `api/orders.service.ts` and `db/orders.repo.ts`. An `email` client in `lib/email.ts` has `email.send({ to, template, data })`.

Add an `orders.cancel` procedure: it sets the order's status to `cancelled`, releases every stock reservation that is still `held`, and emails the order's customer. All three must succeed or none.

Do not write or change tests.
