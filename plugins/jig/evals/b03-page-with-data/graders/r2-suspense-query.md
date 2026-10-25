---
type: llm
focus: {source: file, path: .eval/diff-app.txt}
weight: 1
---

Judge only the one question below. The input is the git diff of the change the agent made to the app code, without its tests. If the diff has no code that decides the question, the verdict is FAIL.

Question: Does the client part read the product with `useSuspenseQuery` and the same input as the server prefetch, with no loading branch?

PASS if it calls `useSuspenseQuery(trpc.products.byId.queryOptions({ id }))` with the same `id` input as the server prefetch and has no `isLoading`/`isPending` branch. FAIL if it reads with `useQuery`, uses a different input, or branches on a loading flag.
