---
type: llm
weight: 1
---

Judge only the one point below. Ignore every other quality of the answer. Do not fail the answer for a fault that this point does not name.

PASS if the fix does NOT rely on any of these: a `startTransition` option passed to `useQueryStates` or a nuqs parser, `setFilters` wrapped in `startTransition`, `placeholderData`, `keepPreviousData`. FAIL if the fix relies on one of them.
