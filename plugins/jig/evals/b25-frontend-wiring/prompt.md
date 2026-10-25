---
description: "frontend-wiring: the options-proxy wiring, one QueryClient factory"
tags: [obedience, frontend, regression]
max_turns: 40
timeout_seconds: 1200
allowed_tools: [Read, Glob, Grep, Skill, Write, Edit, Bash]
---

If a skill named `frontend-wiring` is available to you, invoke it with the Skill tool before you start. If it is not available, work without it.

The working directory is a store app: Next.js App Router, tRPC v11, TanStack Query v5, Drizzle and shadcn/ui. It has its tRPC routers (`lib/trpc/routers/_app.ts`), its context (`createTRPCContext` in `lib/trpc/init.ts`) and its API route, but no wiring between tRPC and TanStack Query: `lib/trpc/server.tsx` and `lib/trpc/react.tsx` do not exist, and the root layout has no provider. So the products page does not build.

The products page, `app/products/page.tsx`, prefetches `products.list` with `prefetch`, `trpc` and `HydrateClient` from `@/lib/trpc/server`. `ProductsList` reads the query with `useSuspenseQuery`, through `useTRPC` from `@/lib/trpc/react`.

Wire tRPC with TanStack Query, so the page prefetches the query on the server and `ProductsList` reads it while it streams.

Do not write or change tests.
