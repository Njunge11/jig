---
type: llm
weight: 1
---

Judge only the one point below. Ignore every other quality of the answer. Do not fail the answer for a fault that this point does not name.

PASS if a `prefetch` helper calls `prefetchQuery` without `await` (`void`), and `HydrateClient` wraps children in `HydrationBoundary` with `dehydrate(getQueryClient())`. FAIL if the helper awaits, or there is no `HydrateClient`.
