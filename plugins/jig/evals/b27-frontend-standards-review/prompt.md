---
description: "frontend-standards: review a component against the rules"
tags: [obedience, frontend, regression]
max_turns: 8
timeout_seconds: 420
allowed_tools: [Read, Glob, Grep, Skill]
---

If a skill named `frontend-standards` is available to you, invoke it with the Skill tool before you answer. If it is not available, answer without it.

The app is Next.js App Router + tRPC v11 + TanStack Query v5 + Drizzle + shadcn/ui. Review this component. List each fault and its fix.

```tsx
"use client";
export function OrderList({ productId, tone }: { productId: string; tone: "green" | "red" }) {
  const trpc = useTRPC();
  const { data: ids } = useSuspenseQuery(trpc.orders.ids.queryOptions({ productId }));
  const [count, setCount] = useState(0);
  useEffect(() => { setCount(ids.length); }, [ids]);
  return (
    <div className="bg-white text-gray-900">
      <p className={`text-${tone}-600`}>{count} orders</p>
      <input placeholder="Search orders" className="border-gray-300" />
      {ids.map((id) => <OrderRow key={id} id={id} />)}
      <button onClick={() => refresh()}><RefreshCw className="h-4 w-4" /></button>
    </div>
  );
}
function OrderRow({ id }: { id: string }) {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(trpc.orders.byId.queryOptions({ id }));
  return <div>{data.name}</div>;
}
```

Do not write any file.
