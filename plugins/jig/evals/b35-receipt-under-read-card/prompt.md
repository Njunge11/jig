---
description: "state-machines: fix a receipt a read-only card took by its position"
tags: [obedience, frontend, regression]
max_turns: 40
timeout_seconds: 1200
allowed_tools: [Read, Glob, Grep, Skill, Write, Edit, Bash]
---

If a skill named `state-machines` is available to you, invoke it with the Skill tool before you start. If it is not available, work without it.

The working directory is a store app: Next.js App Router, tRPC v11, TanStack Query v5, Drizzle, the AI SDK and XState v5. The server owns the order's machine, `orderMachine`, in `features/orders/machine/`, and stores each order's snapshot in its `stage` column. The chat reads every order's stored stage in one request, `trpc.orders.stages`.

A chat shows one card per part of a message, through the card map in `channels/web/ui/cards/`. Several cards can be about the same order: the details card of the turn that created the order, the details card of a turn that reopened its form, and so on. `channels/web/ui/chat-transcript.tsx` draws the parts, and `channels/web/ui/staged-part.tsx` gives a staged card the order's stage. The overview card, `features/orders/ui/cards/overview-card/`, is already built.

A shopper reports two problems:

1. "I asked for the overview of a shipped order in a new chat. Under the details it says 'Payment received · invoice 1'. Nothing in this chat took a payment."
2. "In the chat that created the order, after I asked for the overview, the 'Add gift wrapping?' offer under the order's first card disappeared."

Fix both.

Do not write or change tests.
