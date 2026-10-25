---
name: frontend-wiring
description: The one-time tRPC + TanStack Query v5 wiring for a Next.js App Router app — the query client, the server prefetch and hydration helpers, the browser provider. Use when you create or change the tRPC client or server wiring, or when you diagnose a hydration, prefetch, or shared-cache fault. Invoke it before you touch the wiring.
user-invocable: false
---

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

**`lib/trpc/react.tsx`** — browser provider. The QueryClient is a **module-level singleton in the browser**, **new-per-request on the server** (never share one across requests). Exposes `useTRPC()`. This is the shape of the tRPC docs' `trpc/client.tsx` (trpc.io/docs/client/tanstack-react-query/server-components):

```tsx
"use client";
import type { QueryClient } from "@tanstack/react-query";
import { QueryClientProvider } from "@tanstack/react-query";
import { createTRPCClient, httpBatchStreamLink } from "@trpc/client";
import { createTRPCContext } from "@trpc/tanstack-react-query";
import { useState } from "react";
import { makeQueryClient } from "./query-client";
import type { AppRouter } from "./routers/_app";

export const { TRPCProvider, useTRPC } = createTRPCContext<AppRouter>();

let browserQueryClient: QueryClient | undefined;
function getQueryClient() {
  if (typeof window === "undefined") return makeQueryClient(); // server: always a new client
  return (browserQueryClient ??= makeQueryClient()); // browser: one client for the tab
}

function getUrl() {
  const base = typeof window !== "undefined" ? "" : process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000";
  return `${base}/api/trpc`;
}

export function TRPCReactProvider({ children }: { children: React.ReactNode }) {
  // no useState for the QueryClient: React discards state from a render that suspends
  const queryClient = getQueryClient();
  const [trpcClient] = useState(() =>
    createTRPCClient<AppRouter>({ links: [httpBatchStreamLink({ url: getUrl() })] }),
  );
  return (
    <QueryClientProvider client={queryClient}>
      <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
        {children}
      </TRPCProvider>
    </QueryClientProvider>
  );
}
```

The root `app/layout.tsx` wraps `{children}` in `<TRPCReactProvider>`. A data transformer (superjson) goes in three places at once: the router's `initTRPC.create({ transformer })`, the link's `transformer`, and `serializeData` / `deserializeData` in `makeQueryClient`'s `dehydrate` / `hydrate` options.
