---
description: "calibration: the b27-frontend-standards-review graders on a fixed good answer"
tags: [calibration]
runs: 1
max_turns: 2
timeout_seconds: 120
allowed_tools: []
---

Reply with exactly the text between the ANSWER markers, word for word, and nothing else. Do not add or change anything.

ANSWER START
Faults and fixes:

1. **Raw palette colors.** `bg-white`, `text-gray-900` and `border-gray-300` bypass the theme. Use semantic tokens: `bg-background`, `text-foreground`, `border-input`.
2. **Class built from a template literal.** Tailwind scans source as plain text, so `text-${tone}-600` is never generated. Map each tone to a complete class string, on semantic tokens: `const toneClass = { green: "text-primary", red: "text-destructive" } as const;` then `className={toneClass[tone]}`.
3. **Derived state synced by an effect.** `count` is `ids.length` kept in `useState` and copied in a `useEffect`. Delete both and derive it during render: `const count = ids.length;`.
4. **One query per row (N+1).** Each `OrderRow` runs `orders.byId`, so a list of 50 runs 50 queries. Make the list procedure return the rows with their names (`orders.list({ productId })`) and pass each row's data down.
5. **Input with no label.** The placeholder is not a label. Add `<Label htmlFor="order-search">Search orders</Label>` with `<Input id="order-search" />` from the kit.
6. **Icon-only button with no accessible name.** Use the kit's `Button` with `size="icon"` and `aria-label="Refresh orders"`, and mark the icon `aria-hidden`. `refresh` is also undefined: invalidate the list query instead.

```tsx
"use client";
const toneClass = { green: "text-primary", red: "text-destructive" } as const;

export function OrderList({ productId, tone }: { productId: string; tone: keyof typeof toneClass }) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { data: orders } = useSuspenseQuery(trpc.orders.list.queryOptions({ productId }));
  const count = orders.length;
  return (
    <div className="bg-background text-foreground">
      <p className={toneClass[tone]}>{count} orders</p>
      <Label htmlFor="order-search">Search orders</Label>
      <Input id="order-search" />
      {orders.map((c) => <div key={c.id}>{c.name}</div>)}
      <Button
        size="icon"
        variant="ghost"
        aria-label="Refresh orders"
        onClick={() => queryClient.invalidateQueries(trpc.orders.list.queryFilter({ productId }))}
      >
        <RefreshCw aria-hidden />
      </Button>
    </div>
  );
}
```
ANSWER END
