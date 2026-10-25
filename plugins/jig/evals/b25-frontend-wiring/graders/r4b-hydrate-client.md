---
type: llm
focus: {source: file, path: .eval/diff-app.txt}
weight: 1
---

Judge only the one question below. The input is the git diff of the change the agent made to the app code, without its tests. If the diff has no code that decides the question, the verdict is FAIL.

Question: is there a `HydrateClient` server component that wraps its children in `HydrationBoundary` with `state={dehydrate(getQueryClient())}`, using the same per-request client the prefetch used?

PASS if yes. FAIL if there is no such component, or it dehydrates a different QueryClient.
