---
description: "flow-diagram: a code path becomes one linear data file where every card tells what happens with no file names, every step proves itself with file:line in code, and each seeded second-look detail is its own item"
tags: [obedience, docs, regression, flow-diagram]
max_turns: 40
timeout_seconds: 1200
allowed_tools: [Read, Glob, Grep, Skill, Write, Edit, Bash]
---

If a skill named `flow-diagram` is available to you, invoke it with the Skill tool before you start. If it is not available, work without it.

The working directory is a store app: Next.js App Router, tRPC v11, TanStack Query v5 and Drizzle. The orders feature is under `features/orders/`.

How does cancelling an order work in this codebase? Trace it from the `orders.cancel` procedure and show me the path as a step-by-step diagram I can click through. Call the flow `order-cancellation`.

Do not change any app code.
