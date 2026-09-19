---
description: "recipe-search-and-filters: a search over a capped list still goes to the server"
tags: [obedience, frontend]
runs: 1
max_turns: 8
timeout_seconds: 420
allowed_tools: [Read, Glob, Grep, Skill]
---

If a skill named `recipe-search-and-filters` is available to you, invoke it with the Skill tool before you answer. If it is not available, answer without it.

The app is Next.js App Router + tRPC v11 + TanStack Query v5 + Drizzle + shadcn/ui.

```ts
// features/home/api/home.service.ts
const HOME_JOBS = 5;
const HOME_CANDIDATES_PER_JOB = 5;
// overview(companyId): the 5 newest open jobs, each with its 5 newest candidates
// features/home/api/home.router.ts
export const homeRouter = router({
  overview: orgProcedure.query(({ ctx }) => home.overview(ctx.companyId)),
});
// features/home/ui/home-page.tsx  ("use client")
export function HomePage() {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(trpc.home.overview.queryOptions());
  return <JobsCard jobs={data.jobs} />;
}
```

Add a search box to the Home page. It finds a job by its title or by a candidate's name. The page shows only about 25 rows, so keep the change small.

Do not write any file. Reply with the full code of every file you add or change.
