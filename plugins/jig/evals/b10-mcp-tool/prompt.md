---
description: "backend-entry-points MCP entry: annotations, error channel, structuredContent"
tags: [obedience, backend, regression]
max_turns: 40
timeout_seconds: 1200
allowed_tools: [Read, Glob, Grep, Skill, Write, Edit, Bash]
---

If a skill named `backend-entry-points` is available to you, invoke it with the Skill tool before you start. If it is not available, work without it.

The working directory is a store app: Next.js App Router, tRPC v11, TanStack Query v5, Drizzle and nuqs. It has an MCP server built on the official TypeScript SDK: `lib/mcp/server.ts` builds it, `app/api/mcp/route.ts` serves it, `lib/mcp/idempotent.ts` and `lib/mcp/caller.ts` are its shared parts, and tools live in `features/<feature>/mcp/`. `products.deleteProduct(id, storeId)` exists on the service in `features/products/api/products.service.ts` and answers `{ ok: true }` or `{ ok: false, reason: 'notFound' | 'hasOrders' }`.

Add the MCP tool `delete_product`.

Do not write or change tests.
