---
type: llm
focus: {source: file, path: .eval/diff-app.txt}
weight: 1
---

Judge only the one question below. The input is the git diff of the change the agent made to the app code, without its tests. If the diff has no code that decides the question, the verdict is FAIL.

Question: Does the server page prefetch `products.byId` without awaiting the product data?

PASS if the page calls `prefetch(trpc.products.byId.queryOptions({ id }))` (or `void queryClient.prefetchQuery(...)`) with no `await` on it, and passes no product data to the client part as props. Awaiting `params` to read the id is fine. FAIL if the page awaits the product data (`fetchQuery`, a server caller, or an awaited prefetch), passes it as props, or has no server prefetch.
