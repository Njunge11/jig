---
name: data-fetching
description: Rules for data-fetching and fetch performance in tRPC + TanStack Query v5 + Next.js App Router code. Use when writing or reviewing pages, client components, queries, mutations, loading/error UI, optimistic updates, or when diagnosing slow pages, waterfalls, duplicate fetches, or spinner problems.
---

# Data Fetching & Performance

Stack: **tRPC + TanStack Query v5 + Next.js App Router**. When code in
the repo disagrees with a rule here, the rule wins. Per-rule doc links:
[`sources.md`](sources.md).

## Golden path

Kick off the query on the **server** (no `await`), stream it, and read
it in the client with `useSuspenseQuery`. The Suspense fallback shows
meanwhile. The client never re-fetches what the server started.

```tsx
export default async function Page() {
  prefetch(trpc.users.funnel.queryOptions({ period: "30d" })); // fire, don't await
  prefetch(trpc.users.table.queryOptions({ page: 1 }));        // fires in parallel
  return (
    <HydrateClient>
      <Suspense fallback={<FunnelCardsSkeleton />}><FunnelCards /></Suspense>
      <Suspense fallback={<UsersTableSkeleton />}><UsersTable /></Suspense>
    </HydrateClient>
  );
}
```

1. The page `prefetch`es every query its tree renders, wrapped in
   `HydrateClient`.
2. Do not `await` a prefetch by default — it blocks the HTML on that
   query. Rule 19 names the only cases that earn an awaited prefetch,
   and then it is `await Promise.all([...])` over the prefetches, never
   one await after another.
3. Server `prefetch` and client `useSuspenseQuery` call the
   **identical** `trpc.x.queryOptions(input)`. A mismatched input is a
   cache miss and a refetch.
4. The wiring (`@trpc/tanstack-react-query`, not the legacy
   `createHydrationHelpers`) is a one-time install — see
   [`wiring.md`](wiring.md). Everything here assumes it.

## Choosing the read primitive

5. `useSuspenseQuery` for prefetched data. `useQuery` only for data
   fetched **after** mount (user-triggered, dependent on client state),
   with its own loading state — Next.js does not suspend for
   `useQuery`, so it renders `pending` and opts out of
   server-rendering.
6. Several values that belong to one screen section (metrics, counts):
   one aggregating procedure, one `useSuspenseQuery`, one cache entry.
   Inside the procedure, prefer one SQL statement
   (`COUNT(*) FILTER (WHERE …)`); when one statement cannot produce
   them, run the queries in parallel server-side (`Promise.all` on the
   repo calls) and return one object. The fan-out lives next to the
   database, never across the network.
7. Several genuinely independent sources in one component: one
   `useSuspenseQueries` (or `useQueries` for a variable count). Never
   stack `useSuspenseQuery` calls — the first suspends before the
   second starts.
8. Server Components are for prefetch only. Do not render query data in
   a Server Component — that copy is detached from the query client and
   desyncs after the client revalidates. Never use a Server Action as a
   `queryFn` — Server Actions run serially.

## Parallelism and duplicate fetches

9. Independent fetches start together. Fire all prefetches/promises
   first; if you must await, `Promise.all` — never sequential awaits
   for independent data.
10. Awaits that are not queries — `auth()`, `cookies()`, feature
    flags — get their parallelism from composition: sibling async
    components await their own data. A layout that awaits `auth()` and
    then renders a page awaiting a flag check has serialized the two;
    give each its own component, or start both promises before
    awaiting. tRPC queries are not this rule's business — rules 1–2
    and 9 already run them in parallel.
11. No per-row queries. A list that runs one query per row is an N+1;
    return the rows with their joined data from one list procedure.
12. Two components reading the same `queryOptions` is not a duplicate
    fetch — the cache deduplicates by key. Do not lift query results
    into props or context to "save" a fetch.
13. On the server, `getQueryClient` is wrapped in React `cache()`, so
    all prefetches in one request share one client. Never construct a
    second QueryClient per request.

## Caching

14. Set a non-zero `staleTime` (30–60s; higher for reference data). The
    default `0` refetches immediately after hydration, wasting the
    prefetch.
15. Leave `gcTime` at its default (5m) unless a screen provably needs
    longer retention.
16. Query keys are derived from `queryOptions` — never hand-write a
    key. Invalidate through the derived filter:
    `queryClient.invalidateQueries(trpc.users.table.queryFilter())`.
17. One freshness layer. TanStack owns freshness for these queries; do
    not also configure Next route/`fetch` caching for them.

## Streaming — and when not to

18. Wrap independent sections in their own `<Suspense>` so fast
    sections paint while slow ones stream.
19. Streaming is the default, not a law. Two cases earn
    `await prefetch(...)` instead (same wiring, same
    `useSuspenseQuery` — the only change is when the HTML ships): the
    content must be in the initial HTML (a public posting page that
    crawlers and link unfurls read), or the query is so small and fast
    that its skeleton is just flicker (the company name in the shell).
    A dashboard of sections streams; a public document page awaits.
    Choose per section, and say why in the code.

## Loading UI

20. Every fetching route segment has a `loading.tsx`. It auto-wraps the
    page in a Suspense boundary and shows instantly on navigation.
21. Derive the skeleton from the real component: copy its container,
    grid, and sizing classes; replace content with the `Skeleton`
    primitive. Same column count, same card sizes — zero layout shift
    on swap. A mismatched skeleton is worse than a spinner.
22. One skeleton per boundary. A component using `useSuspenseQuery`
    suspends — it must not also branch on `isLoading` or render its own
    spinner inside the already-suspended boundary.
23. Keep runtime data out of `layout.tsx` (`cookies()`, `headers()`,
    uncached fetches) — a layout that blocks defeats `loading.tsx`.
    Fetch in the page, or give the layout's dynamic part its own
    boundary.

## Error UI

24. Every fetching route segment has an `error.tsx`: a Client Component
    receiving `{ error, reset }`, with `reset()` wired to a "Try again"
    action.
25. Isolate a failing section with an inner `react-error-boundary`
    around its `<Suspense>`, so one broken card does not take the page.
26. Route errors by channel: read failures render in the boundary;
    mutation failures surface as a toast naming the action; form-field
    validation renders inline at the field. Do not mix the channels.

## Optimistic updates

27. Use optimism for instant-feel mutations the user expects to succeed
    (toggle, rename, reorder). Do not use it for destructive or
    irreversible actions — those wait for the server.
28. Default: variables-only. Render the pending row from the mutation's
    `variables` + `isPending`; no cache writes; it reconciles itself on
    settle.
29. Cache-write optimism only when other components must reflect the
    change immediately. Callbacks receive `context` with
    `context.client`; `onMutate`'s return arrives as the
    `onMutateResult` parameter:

```ts
const filter = trpc.promo.list.queryFilter();
useMutation(trpc.promo.markPaid.mutationOptions({
  onMutate: async (vars, context) => {
    await context.client.cancelQueries(filter);                // 1 cancel
    const prev = context.client.getQueryData(filter.queryKey); // 2 snapshot
    context.client.setQueryData(filter.queryKey, apply(prev, vars)); // 3 set
    return { prev };
  },
  onError: (_e, _v, onMutateResult, context) =>
    context.client.setQueryData(filter.queryKey, onMutateResult.prev), // rollback
  onSettled: (_d, _e, _v, _r, context) =>
    context.client.invalidateQueries(filter),                  // reconcile
}));
```

    The order matters: `cancelQueries` first (a slow refetch would
    clobber the optimistic value); invalidate in `onSettled` (it runs
    even after a rollback).

## Secondary surfaces

30. Modals, drawers, tabs, and detail panels get page treatment:
    prefetch their data on the trigger's hover/focus
    (`queryClient.prefetchQuery(trpc.x.queryOptions(input))`) and open
    them against the same cache — never an ad-hoc fetch with a fresh
    spinner.
31. Load heavy panel components with `next/dynamic` and prefetch their
    data on hover, so opening is instant despite the lazy code.

## Review

Rules 1–31 are this skill's review checklist, run by the
`review-frontend-feature` skill.
