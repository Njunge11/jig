---
description: "recipe-search-and-filters: the server narrows, the URL owns q, the input debounces"
tags: [obedience, frontend]
runs: 1
max_turns: 8
timeout_seconds: 420
allowed_tools: [Read, Glob, Grep, Skill]
---

If a skill named `recipe-search-and-filters` is available to you, invoke it with the Skill tool before you answer. If it is not available, answer without it.

The app is Next.js App Router + tRPC v11 + TanStack Query v5 + Drizzle + shadcn/ui. A workspace can hold thousands of jobs.

```ts
// features/jobs/api/jobs.router.ts
export const jobsRouter = router({
  list: orgProcedure.input(z.object({})).query(({ ctx }) => jobs.list(ctx.companyId)),
});
// features/jobs/api/jobs.service.ts
export const makeJobsService = ({ repo }: { repo: JobsRepo }) => ({
  list: (companyId: string) => repo.list(companyId),
});
// features/jobs/db/jobs.repo.ts
list: (companyId: string) =>
  db.select().from(jobsTable).where(eq(jobsTable.companyId, companyId)).orderBy(desc(jobsTable.createdAt)),
// app/jobs/page.tsx
export default async function Page() {
  prefetch(trpc.jobs.list.queryOptions({}));
  return <HydrateClient><Suspense fallback={<JobsSkeleton />}><JobsList /></Suspense></HydrateClient>;
}
// features/jobs/ui/jobs-list.tsx  ("use client")
export function JobsList() {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(trpc.jobs.list.queryOptions({}));
  return <JobsTable rows={data} />;
}
```

Add a search box that finds jobs by title.

Do not write any file. Reply with the full code of every file you add or change.
