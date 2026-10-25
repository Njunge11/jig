---
type: llm
focus: {source: file, path: .eval/diff-app.txt}
weight: 1
---

Judge only the one question below. The input is the git diff of the change the agent made to the app code, without its tests. A deleted file shows as `deleted file mode` with every line removed.

Question: does the diff delete a `loading.tsx` (or empty it), or does it add a Next.js data cache for the queries — a `fetch` `cache` or `next.revalidate` option, a route `export const revalidate`, a `"use cache"` directive, or `unstable_cache`?

PASS if the diff does none of these. A file the diff does not show is kept as it is. `experimental.staleTimes` is the router's page cache, not a data cache, so setting it is fine. FAIL if the diff deletes or empties a `loading.tsx`, or adds any of those data caches.
