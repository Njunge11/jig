---
type: llm
weight: 2
---

PASS if the query is keyed on a `useDeferredValue` of the nuqs state (not on the fresh state), `useSuspenseQuery` stays, and the list dims while the fresh value and the deferred value differ.

FAIL if the fix passes `startTransition` to `useQueryStates` or to a nuqs parser, wraps `setFilters` in `startTransition`, uses `placeholderData` or `keepPreviousData`, or replaces `useSuspenseQuery` with `useQuery`.
