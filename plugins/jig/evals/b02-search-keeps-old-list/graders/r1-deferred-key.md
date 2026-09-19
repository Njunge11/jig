---
type: llm
weight: 1
---

Judge only the one point below. Ignore every other quality of the answer. Do not fail the answer for a fault that this point does not name.

PASS if the query input is a `useDeferredValue` of the nuqs state, and `useSuspenseQuery` stays. FAIL if the query is keyed on the fresh nuqs state, or `useSuspenseQuery` was replaced by `useQuery`.
