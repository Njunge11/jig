---
type: llm
weight: 2
---

PASS only if: the server page calls `prefetch(trpc.jobs.byId.queryOptions(...))` without awaiting it and wraps the client tree in `HydrateClient` and a `Suspense` with a skeleton; the client part reads with `useSuspenseQuery` and the identical input; the client part has no `isLoading`/`isPending` branch; the answer names or adds `loading.tsx` and `error.tsx` (or an error boundary) for the route.

FAIL if the client reads with `useQuery` and branches on a loading flag, if the page awaits the data and passes it as props, or if there is no server prefetch.
