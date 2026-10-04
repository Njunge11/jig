---
type: llm
weight: 1
---

Judge only the one point below. Ignore every other quality of the answer. Do not fail the answer for a fault that this point does not name.

PASS if the code the answer adds or changes keeps TanStack Query as the only owner of the data's freshness and keeps the loading UI. A file the answer does not show is kept as it is. `experimental.staleTimes` is the router's page cache, not a data cache: setting it does not fail this point. Prose that names `router.refresh()`, `revalidatePath` or `revalidateTag` as advice does not fail this point.

FAIL only if the answer's code deletes a `loading.tsx`, or adds a Next data cache for the queries: a `fetch` `cache` or `next.revalidate` option, a route `export const revalidate`, a `"use cache"` directive, or `unstable_cache`.
