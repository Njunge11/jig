---
type: llm
weight: 1
---

Judge only the one point below. Ignore every other quality of the answer. Do not fail the answer for a fault that this point does not name.

PASS if the optimistic cache write does all of: cancel the outgoing queries (`cancelQueries`) in `onMutate`, snapshot the previous data, set the new data, roll back from the snapshot in `onError`, invalidate in `onSettled`. The QueryClient may be reached as `context.client` (the context argument of the TanStack Query v5 mutation callbacks) or as `queryClient`; both are correct. FAIL if there is no `cancelQueries`, no rollback, or invalidation runs in `onSuccess` only.
