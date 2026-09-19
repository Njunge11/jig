---
description: "frontend-wiring: the options-proxy wiring, one QueryClient factory"
tags: [obedience, frontend]
runs: 1
max_turns: 10
timeout_seconds: 420
allowed_tools: [Read, Glob, Grep, Skill]
---

If a skill named `frontend-wiring` is available to you, invoke it with the Skill tool before you answer. If it is not available, answer without it.

Wire tRPC v11 with TanStack Query v5 into a fresh Next.js App Router app, so a Server Component can prefetch a query and a Client Component can read it with `useSuspenseQuery` while it streams. `appRouter` and `createTRPCContext` exist.

Do not write any file. Reply with the full code of each wiring file.
