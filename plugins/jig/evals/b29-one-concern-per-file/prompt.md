---
description: "backend-standards: a task that adds a second concern adds a file, never a section of the feature's service"
tags: [obedience, backend]
runs: 1
max_turns: 8
timeout_seconds: 420
allowed_tools: [Read, Glob, Grep, Skill]
---

If a skill named `backend-standards` is available to you, invoke it with the Skill tool before you answer. If it is not available, answer without it.

The app is Next.js App Router + tRPC v11 + Drizzle. `features/drafts/` has `api/drafts.router.ts`, `api/drafts.service.ts` and `db/drafts.repo.ts`. `drafts.service.ts` is `makeDraftsService({ repo, now })` and returns `{ createDraft, readDraft, updateDraft }`; `updateDraft` applies a recruiter's edit to a draft's details and returns the saved draft.

Add two things to the feature:

1. A `publishDraft(draftId)` service method: it checks that the draft's details are complete, copies the draft into a `jobs` row through `repo.insertJob`, marks the draft `published`, and returns the job id. The copy and the mark must succeed together.
2. A `draftChanges(before, after)` function: it returns the list of `{ field, value }` pairs whose value differs between two draft detail records, in the form's field order, for the receipt card the chat shows after an update.

Do not write any file. Reply with the full path and the full code of every file you add or change.
