---
type: llm
weight: 1
---

Judge only the one point below. Ignore every other quality of the answer. Do not fail the answer for a fault that this point does not name.

PASS if `draftChanges` lives in a module of its own (for example `api/draft-changes.ts`) that holds nothing but the change listing and its private helpers. FAIL if `draftChanges` is added to `drafts.service.ts`, or sits in the same file as `publishDraft`.
