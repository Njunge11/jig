---
description: "recipe-chat: registry components, card map, status wired"
tags: [obedience, frontend, regression]
max_turns: 40
timeout_seconds: 1200
allowed_tools: [Read, Glob, Grep, Skill, Write, Edit, Bash]
---

If a skill named `recipe-chat` is available to you, invoke it with the Skill tool before you start. If it is not available, work without it.

The working directory is a store app: Next.js App Router, tRPC v11, TanStack Query v5, Drizzle, shadcn/ui and the AI SDK (`ai`, `@ai-sdk/react`). The assistant endpoint `/api/chat` streams AI SDK UI messages: text parts plus three custom data parts — `data-product-card` `{ productId, title }`, `data-order-card` `{ orderId, number }` and `data-delivery-slot` `{ start, end }`.

Build the chat surface with `useChat`, on the page `/chat`.

Do not write or change tests.
