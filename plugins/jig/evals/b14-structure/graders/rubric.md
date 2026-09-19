---
type: llm
weight: 2
---

PASS only if the paths match this tree: `features/invites/api/invitation.router.ts` (and the feature router `features/invites/api/invites.router.ts`), `features/invites/api/invites.service.ts`, `features/invites/db/invites.repo.ts`, the table in `db/schema/<domain>.ts`, `app/invites/page.tsx` as a thin route file (with `loading.tsx` and `error.tsx`), `features/invites/ui/invites-page.tsx`, `features/invites/ui/columns.tsx`, `features/invites/ui/search-params.ts`, the UI test under `features/invites/ui/__tests__/`, and the repo test at `features/invites/db/__tests__/invites.repo.test.ts`.

FAIL if feature logic is placed under `app/`, `components/`, `lib/` or `server/`, or if tests sit in a top-level `tests/` folder.
