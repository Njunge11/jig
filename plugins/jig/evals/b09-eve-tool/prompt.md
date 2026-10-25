---
description: "backend-entry-points eve entry: module-scope execute, failures as values"
tags: [obedience, backend, regression]
max_turns: 40
timeout_seconds: 1200
allowed_tools: [Read, Glob, Grep, Skill, Write, Edit, Bash]
---

If a skill named `backend-entry-points` is available to you, invoke it with the Skill tool before you start. If it is not available, work without it.

The working directory is a store app: Next.js App Router, tRPC v11, TanStack Query v5, Drizzle and nuqs. It has an eve agent; its tools live in `agent/tools/`. `features/orders/` has `api/orders.service.ts` and `db/orders.repo.ts`; the service's `getOrder(orderId, storeId)` answers the order, or `null` when the store has no such order. `agent/lib/caller/` has `authz` (in `authz.ts`), `permittedCaller(ctx, authz, permission)` (in `permitted-caller.ts`, answers `{ storeId }` or `null`) and `PERMISSIONS.ORDERS_READ` (in `permissions.ts`). The db client is `db` in `db/client.ts`.

Add a tool `get_order` that returns one order by id for the caller's store. A missing order and a caller without the permission are expected cases.

Do not write or change tests.
