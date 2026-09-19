---
description: "a skeleton-on-search bug fires the search recipe or the frontend standards"
tags: [triggering]
runs: 1
max_turns: 4
timeout_seconds: 420
allowed_tools: [Read, Glob, Grep, Skill]
---

The app is Next.js App Router + tRPC v11 + TanStack Query v5 + Drizzle + shadcn/ui. The route has a `loading.tsx` with a full-page skeleton.

Bug: each time the user searches the jobs list, the whole page falls to the skeleton until the new result arrives. The old list must stay on screen, dimmed, while the new result loads.

```tsx
"use client";
export function JobsList() {
  const trpc = useTRPC();
  const [filters, setFilters] = useQueryStates(jobsListParams); // nuqs
  const { data } = useSuspenseQuery(trpc.jobs.list.queryOptions(filters));
  return (
    <div>
      <SearchInput value={filters.q} onCommit={(q) => setFilters({ q, page: 1 })} /> {/* commits after a 400 ms debounce */}
      <JobsTable rows={data.rows} total={data.total} />
    </div>
  );
}
```

Fix `JobsList`. Do not write any file. Reply with the full fixed component and two sentences on why the fix works.
