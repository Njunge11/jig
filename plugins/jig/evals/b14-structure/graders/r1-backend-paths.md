---
type: llm
weight: 1
---

Judge only the one point below. Ignore every other quality of the answer. Do not fail the answer for a fault that this point does not name.

PASS if the backend paths are `features/invites/api/invitation.router.ts`, the feature router `features/invites/api/invites.router.ts`, `features/invites/api/invites.service.ts` (or a service named for its one concern, such as `invitation.service.ts`), `features/invites/db/invites.repo.ts` (or `invitation.repo.ts`, `invitations.repo.ts`), and the table in `db/schema/<domain>.ts`. FAIL if one of these is placed elsewhere.
