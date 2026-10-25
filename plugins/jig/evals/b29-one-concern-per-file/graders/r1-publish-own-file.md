---
type: llm
focus: {source: file, path: .eval/diff-app.txt}
weight: 1
---

Judge only the one question below. The input is the git diff of the change the agent made to the app code, without its tests. If the diff has no code that decides the question, the verdict is FAIL.

Question: is `publishDraft` defined in a file of its own, not in `drafts.service.ts` and not in the file that defines `draftChanges`?

PASS if yes, for example `api/publish-draft.service.ts`. FAIL if `publishDraft` is added to `drafts.service.ts`, or shares a file with `draftChanges`.
