---
description: "state-machines: a screen of a server-owned machine renders from hasTag and meta, no stage table"
tags: [obedience, frontend, regression]
max_turns: 40
timeout_seconds: 1200
allowed_tools: [Read, Glob, Grep, Skill, Write, Edit, Bash]
---

If a skill named `state-machines` is available to you, invoke it with the Skill tool before you start. If it is not available, work without it.

The working directory is a store app: Next.js App Router, tRPC v11, TanStack Query v5, Drizzle, nuqs and XState v5. The server owns the product draft's machine, `productDraftMachine`, in `features/product-draft/machine/`, and stores each draft's `{ value }` in a `stage` column. `trpc.productDraft.read({ draftId })` returns the stored stage, and `trpc.productDraft.send({ draftId, event })` moves the draft on the server and returns its next stage. `features/product-draft/ui/` has `DetailsForm`, `ReviewForm` and `SummaryView`. The page `app/drafts/[draftId]/page.tsx` prefetches `productDraft.read` and renders `ProductDraftPanel` from `features/product-draft/ui/product-draft-panel.tsx`, which does not exist yet.

Write `ProductDraftPanel({ draftId })`. It shows the form of the draft's current state (`DetailsForm`, `ReviewForm` or `SummaryView`) and an Edit button only while the draft can be edited. A click on Submit must move the draft.

Do not write or change tests.
