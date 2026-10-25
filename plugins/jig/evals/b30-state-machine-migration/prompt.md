---
description: "state-machines: the machine keeps a road forward for every stage value it has ever stored"
tags: [obedience, backend, regression]
max_turns: 40
timeout_seconds: 1200
allowed_tools: [Read, Glob, Grep, Skill, Write, Edit, Bash]
---

If a skill named `state-machines` is available to you, invoke it with the Skill tool before you start. If it is not available, work without it.

The working directory is a store app: Next.js App Router, tRPC v11, TanStack Query v5, Drizzle, nuqs and XState v5. The server owns the product draft's machine, in `features/product-draft/machine/`. Each `product_drafts` row stores `{ value, context }` of its snapshot in a `stage` jsonb column. `features/product-draft/api/save-details.service.ts` restores it with `draftMachine.resolveState(row.stage)`, moves it with `transition`, and stores the next `{ value, context }` with a compare-and-set on the old value. The app is in production.

Add a pricing stage. After the details are complete, the seller fills a pricing form (`price`, `currency`). A `PRICING_SAVED` event carries `pricingMissing: string[]`. The stage `pricing_pending` shows `meta.form: "pricing"`; `PRICING_SAVED` keeps it there while a pricing field is missing, else moves it to `pricing_complete`, tagged `saved`. Once the details are complete, the draft is in the pricing stage.

Change the machine module. Do not write or change tests.
