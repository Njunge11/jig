---
description: "frontend-standards: a return to a page shows it at once, with no skeleton"
tags: [obedience, frontend]
runs: 1
max_turns: 8
timeout_seconds: 420
allowed_tools: [Read, Glob, Grep, Skill]
---

If a skill named `frontend-standards` is available to you, invoke it with the Skill tool before you answer. If it is not available, answer without it.

The app is Next.js 16 App Router + tRPC v11 + TanStack Query v5 + Drizzle + shadcn/ui. Every page reads the session, so every page is dynamic. A user reports: "I open Jobs, then Home, then Jobs again. Each click shows the grey skeleton, also on a page I saw a second ago. The app feels slow." The production build shows the same thing. Fix it.

```ts
// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    typedRoutes: true,
  },
};

export default nextConfig;
```

```ts
// lib/trpc/query-client.ts
export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { staleTime: 30 * 1000 },
      dehydrate: {
        shouldDehydrateQuery: (q) =>
          defaultShouldDehydrateQuery(q) || q.state.status === "pending",
        shouldRedactErrors: () => false,
      },
    },
  });
}
```

```tsx
// components/ui/app-sidebar.tsx
"use client";
const items = [
  { title: "Home", url: "/" },
  { title: "Jobs", url: "/jobs" },
  { title: "Candidates", url: "/candidates" },
];
export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.url}>
            <SidebarMenuButton asChild>
              <Link href={item.url}>{item.title}</Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </Sidebar>
  );
}
```

```tsx
// app/(app)/jobs/page.tsx
export default async function JobsPage() {
  prefetch(trpc.jobs.list.queryOptions());
  return (
    <HydrateClient>
      <JobsList />
    </HydrateClient>
  );
}
```

```tsx
// app/(app)/jobs/loading.tsx
export default function Loading() {
  return <JobsListSkeleton />;
}
```

`app/(app)/page.tsx` (Home) and `app/(app)/candidates/page.tsx` have the same shape, each with its own `loading.tsx`. `JobsList` reads `trpc.jobs.list.queryOptions()` with `useSuspenseQuery`.

Do not write any file. Reply with the full code of every file you add or change.
