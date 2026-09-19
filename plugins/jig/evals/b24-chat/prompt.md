---
description: "recipe-chat: registry components, card map, status wired"
tags: [obedience, frontend]
runs: 1
max_turns: 10
timeout_seconds: 420
allowed_tools: [Read, Glob, Grep, Skill]
---

If a skill named `recipe-chat` is available to you, invoke it with the Skill tool before you answer. If it is not available, answer without it.

The app is Next.js App Router + tRPC v11 + TanStack Query v5 + Drizzle + shadcn/ui. The assistant endpoint `/api/chat` streams AI SDK UI messages: text parts plus a custom `data-job-card` part `{ jobId, title }`.

Build the chat surface with `useChat`.

Do not write any file. Reply with the full code of every file you add or change.
