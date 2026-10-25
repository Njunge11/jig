---
description: "state-machines: a new stage's card part is named in meta"
tags: [obedience, frontend, regression]
max_turns: 40
timeout_seconds: 1200
allowed_tools: [Read, Glob, Grep, Skill, Write, Edit, Bash]
---

If a skill named `state-machines` is available to you, invoke it with the Skill tool before you start. If it is not available, work without it.

The working directory is a store app: Next.js App Router, tRPC v11, TanStack Query v5, Drizzle, the AI SDK and XState v5. The server owns the order's machine, `orderMachine`, in `features/orders/machine/`, and stores each order's snapshot in its `stage` column. The chat reads every order's stored stage in one request, `trpc.orders.stages`.

A chat shows one card per part of a message, through the card map in `channels/web/ui/cards/`. Several cards can be about the same order: the details card of the turn that created the order, the details card of a turn that reopened its form, and so on. `channels/web/ui/chat-transcript.tsx` draws the parts, and `channels/web/ui/staged-part.tsx` gives a staged card the order's stage. The overview card, `features/orders/ui/cards/overview-card/`, only reads the order: it is not staged, and it shows the order's details only.

New feature: once an order is shipped, the chat offers "Leave a review?" under the shipped receipt. When the review is written, the offer goes. The order's row has a new column, `review` (`jsonb`, null until the review is written).

Build the stage, the write that stores the review, and the client part.

Do not write or change tests.
