---
description: "frontend-standards 54 and 56: a review flags a hand-written failure toast, an error file with its own page and a reference made in the browser"
tags: [obedience, frontend, regression]
max_turns: 8
timeout_seconds: 420
allowed_tools: [Read, Glob, Grep, Skill]
---

If a skill named `frontend-standards` is available to you, invoke it with the Skill tool before you answer. If it is not available, answer without it.

The app is Next.js App Router + tRPC v11 + TanStack Query v5 + Drizzle + shadcn/ui. Its query client has one handler for a failed mutation, and `components/ui/route-error.tsx` holds its error page. Review these two files. List each fault and its fix.

```tsx
// features/orders/ui/archive-order-button.tsx
"use client";
export function ArchiveOrderButton({ id }: { id: string }) {
  const trpc = useTRPC();
  const archive = useMutation(
    trpc.orders.archive.mutationOptions({
      onSuccess: (result) => {
        if (result.status !== "archived") {
          toast.error(result.message);
          return;
        }
        toast.success("Order archived");
      },
      onError: () => toast.error("Something went wrong"),
    }),
  );
  return (
    <Button onClick={() => archive.mutate({ id })} disabled={archive.isPending}>
      {archive.isPending ? <Spinner /> : null} Archive
    </Button>
  );
}

// app/orders/error.tsx
"use client";
export default function Error({ retry }: { error: unknown; retry: () => void }) {
  const [reference] = useState(() => crypto.randomUUID().slice(0, 8));
  return (
    <div className="flex flex-col gap-2 p-6">
      <p>Couldn&apos;t load the orders</p>
      <p className="text-sm text-muted-foreground">Reference: {reference}</p>
      <Button onClick={retry}>Try again</Button>
    </div>
  );
}
```

Do not write any file.
