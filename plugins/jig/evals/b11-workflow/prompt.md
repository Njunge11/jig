---
description: "backend-entry-points workflow entry: deterministic function, retry-safe steps"
tags: [obedience, backend, regression]
max_turns: 40
timeout_seconds: 1200
allowed_tools: [Read, Glob, Grep, Skill, Write, Edit, Bash]
---

If a skill named `backend-entry-points` is available to you, invoke it with the Skill tool before you start. If it is not available, work without it.

The working directory is a store app: Next.js App Router, tRPC v11, TanStack Query v5, Drizzle and nuqs. It uses the Workflow DevKit (`"use workflow"` / `"use step"`); `next.config.ts` is already wrapped with `withWorkflow`. `fraud.score(orderId)` in `lib/fraud.ts` calls an LLM. On a rate limit it throws `RateLimitError` (with `retryAfterMs`); when the order was deleted it throws `OrderNotFoundError`, and a deleted order can never be scored. Both error classes are exported beside `fraud`. The orders service (`features/orders/api/orders.service.ts`) has `getScore(orderId)` (the saved score, or `null`), `saveScore(orderId, score)` and `getOwnerEmail(orderId)`. The notifications service (`features/notifications/api/notifications.service.ts`) has `wasSent(key)` and `markSent(key)`. `email.send({ to, template, data })` is in `lib/email.ts`. The db client is `db` in `db/client.ts`.

Add a durable workflow `check-order`: score the order, save the score, email the store owner.

Do not write or change tests.
