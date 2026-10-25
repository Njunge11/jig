---
description: "backend-standards: a task that adds a second concern adds a file, never a section of the feature's service"
tags: [obedience, backend, regression]
max_turns: 40
timeout_seconds: 1200
allowed_tools: [Read, Glob, Grep, Skill, Write, Edit, Bash]
---

If a skill named `backend-standards` is available to you, invoke it with the Skill tool before you start. If it is not available, work without it.

The working directory is a store app: Next.js App Router, tRPC v11, TanStack Query v5, Drizzle and nuqs. `features/drafts/` has `api/drafts.router.ts`, `api/drafts.service.ts`, `api/draft-fields.ts` and `db/drafts.repo.ts`. `drafts.service.ts` is `makeDraftsService({ repo, now, uuid })` and returns `{ createDraft, readDraft, updateDraft }`; `updateDraft` applies a seller's edit to a draft's details and returns the saved draft. `features/products/db/products.repo.ts` has `insert`, which adds one product row.

Add two things to the feature:

1. A `publishDraft(draftId, storeId)` service method: it checks that the draft's details are complete, copies the draft into a `products` row with the products repo's `insert`, marks the draft `published`, and returns the product id. The copy and the mark must succeed together.
2. A `draftChanges(before, after)` function: it returns the list of `{ field, value }` pairs whose value differs between two draft detail records, in the form's field order, for the receipt card the chat shows after an update.

Do not write or change tests.
