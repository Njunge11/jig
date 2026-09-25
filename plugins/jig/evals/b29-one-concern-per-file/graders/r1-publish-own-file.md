---
type: llm
weight: 1
---

Judge only the one point below. Ignore every other quality of the answer. Do not fail the answer for a fault that this point does not name.

PASS if `publishDraft` lives in a file of its own (for example `api/publish-draft.service.ts`). FAIL if `publishDraft` is added to `drafts.service.ts`, or sits in the same file as `draftChanges`.
