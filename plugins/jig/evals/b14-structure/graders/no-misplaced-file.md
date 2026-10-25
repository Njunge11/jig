---
type: llm
focus: {source: file, path: .eval/diff-app.txt}
weight: 1
---

Judge only the one question below. The input is the git diff of the change the agent made to the app code, without its tests. If the diff adds no file for the feature, the verdict is FAIL.

Question: does every file the diff adds (a `new file mode` entry) sit in one of these places: `features/invites/` (any folder below it), `db/schema/`, or the route folder `app/invites/` (a route group such as `app/(app)/invites/` counts)?

PASS if yes. An edit to a file that already exists outside them, such as the app's root tRPC router that registers the feature router or the schema index that re-exports the table, does not count against the diff. FAIL if one added file sits elsewhere: feature code under `app/` other than the route files (`page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`), or under `components/`, `server/`, `lib/` or `src/` outside the feature folder. A shadcn kit component that the diff adds under `components/ui/` is not feature code and does not count against the diff.
