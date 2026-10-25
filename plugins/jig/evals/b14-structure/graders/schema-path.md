---
type: llm
focus: {source: file, path: .eval/diff-app.txt}
weight: 1
---

Judge only the one question below. The input is the git diff of the change the agent made to the app code, without its tests. If the diff has no code that decides the question, the verdict is FAIL.

Question: is the invitations table (its `pgTable(...)` call) defined in a file under the app's root `db/schema/` folder?

PASS if the `pgTable` for the invitations is in a file such as `db/schema/invitations.ts` or `db/schema/stores.ts`. FAIL if it is defined anywhere else, such as in `features/invites/`, or if the diff adds no invitations table.
