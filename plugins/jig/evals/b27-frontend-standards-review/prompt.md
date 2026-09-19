---
description: "frontend-standards: review a component against the rules"
tags: [obedience, frontend]
runs: 1
max_turns: 8
timeout_seconds: 420
allowed_tools: [Read, Glob, Grep, Skill]
---

If a skill named `frontend-standards` is available to you, invoke it with the Skill tool before you answer. If it is not available, answer without it.

The app is Next.js App Router + tRPC v11 + TanStack Query v5 + Drizzle + shadcn/ui. Review this component. List each fault and its fix.

```tsx
"use client";
export function CandidateList({ jobId, tone }: { jobId: string; tone: "green" | "red" }) {
  const trpc = useTRPC();
  const { data: ids } = useSuspenseQuery(trpc.candidates.ids.queryOptions({ jobId }));
  const [count, setCount] = useState(0);
  useEffect(() => { setCount(ids.length); }, [ids]);
  return (
    <div className="bg-white text-gray-900">
      <p className={`text-${tone}-600`}>{count} candidates</p>
      <input placeholder="Search candidates" className="border-gray-300" />
      {ids.map((id) => <CandidateRow key={id} id={id} />)}
      <button onClick={() => refresh()}><RefreshCw className="h-4 w-4" /></button>
    </div>
  );
}
function CandidateRow({ id }: { id: string }) {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(trpc.candidates.byId.queryOptions({ id }));
  return <div>{data.name}</div>;
}
```

Do not write any file.
