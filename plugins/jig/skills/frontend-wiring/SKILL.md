# tRPC + TanStack Query wiring (one-time setup)

The modern integration: `@trpc/tanstack-react-query` (`createTRPCOptionsProxy` + `useTRPC`), **not** the legacy `createHydrationHelpers`. You wire this once per app; per-feature work just calls `prefetch` / `useSuspenseQuery` against it.

**`lib/trpc/query-client.ts`** — one factory, used both sides:

```ts
import { defaultShouldDehydrateQuery, QueryClient } from "@tanstack/react-query";

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { staleTime: 60 * 1000 }, // non-zero → don't refetch right after SSR hydration
      dehydrate: {
        // include in-flight queries so streaming works
        shouldDehydrateQuery: (q) =>
          defaultShouldDehydrateQuery(q) || q.state.status === "pending",
        // don't redact server errors — Next.js uses them to detect dynamic pages
        shouldRedactErrors: () => false,
      },
    },
  });
}
```

**`lib/trpc/server.tsx`** — server caller, `prefetch`, `HydrateClient`:

```ts
import "server-only";
import type { TRPCQueryOptions } from "@trpc/tanstack-react-query";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { cache } from "react";
import { createTRPCContext } from "./init";
import { makeQueryClient } from "./query-client";
import { appRouter } from "./routers/_app";

export const getQueryClient = cache(makeQueryClient); // new-per-request on server
export const trpc = createTRPCOptionsProxy({ ctx: createTRPCContext, router: appRouter, queryClient: getQueryClient });

export function HydrateClient({ children }: { children: React.ReactNode }) {
  return <HydrationBoundary state={dehydrate(getQueryClient())}>{children}</HydrationBoundary>;
}
export function prefetch<T extends ReturnType<TRPCQueryOptions<any>>>(queryOptions: T) {
  const qc = getQueryClient();
  queryOptions.queryKey[1]?.type === "infinite"
    ? void qc.prefetchInfiniteQuery(queryOptions as any)
    : void qc.prefetchQuery(queryOptions);
}
```

**`lib/trpc/react.tsx`** — browser provider. The QueryClient is a **module-level singleton in the browser**, **new-per-request on the server** (never share one across requests). Exposes `useTRPC()`.
