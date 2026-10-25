---
description: "state-machines: a list page's stage tabs and labels come from the machine, not a copy"
tags: [obedience, frontend, regression]
max_turns: 40
timeout_seconds: 1200
allowed_tools: [Read, Glob, Grep, Skill, Write, Edit, Bash]
---

If a skill named `state-machines` is available to you, invoke it with the Skill tool before you start. If it is not available, work without it.

The working directory is a store app: Next.js App Router, tRPC v11, TanStack Query v5, Drizzle, nuqs and XState v5. The server owns the order status machine, `orderStatusMachine`, in `features/orders/machine/`. The `orders.status` column stores the value of each order's stage. The orders page at `/orders` reads `trpc.orders.counts` (the count of orders per status) and `trpc.orders.list({ status })`; it never resolves a snapshot, and has only each row's status. Its code is in `features/orders/ui/`, and the active tab's key is in the URL.

The product names the stages To pack (`needs_packing`), Shipped and Cancelled, on every screen. Today the orders page has tabs for To pack and Shipped only, and its Status column prints the raw status.

Make the orders page show one tab for each of the three stages, each with its count, and name each row's stage with a `StageBadge({ status })` component.

Do not write or change tests.
