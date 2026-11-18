---
description: "calibration: the b41-failure-channel-review graders on a fixed good answer"
tags: [calibration]
runs: 1
max_turns: 2
timeout_seconds: 120
allowed_tools: []
---

Reply with exactly the text between the ANSWER markers, word for word, and nothing else. Do not add or change anything.

ANSWER START
Faults and fixes:

1. **Hand-written failure toasts (frontend-standards 56).** `onSuccess` reads a failure status from the data of the mutation and calls `toast.error(result.message)`, and `onError` calls `toast.error("Something went wrong")`. A feature holds no failure code. Give the mutation its failure title and remove both calls; the handler of the query client shows the toast with the message of the server:

```tsx
const archive = useMutation(
  trpc.orders.archive.mutationOptions({
    meta: { failureTitle: "Couldn't archive the order" },
    onSuccess: () => toast.success("Order archived"),
  }),
);
```

The procedure returns `orThrow(...)`, so the data of the mutation holds no failure.

2. **The error file has a page of its own (frontend-standards 54).** `app/orders/error.tsx` is one statement:

```tsx
"use client";
export { RouteError as default } from "@/components/ui/route-error";
```

3. **The browser makes the error reference (frontend-standards 56).** `crypto.randomUUID()` in the error file is in no server log, so nobody can find the failure with it. A screen never makes a reference: the shared `RouteError` page shows the reference of the server, which `describeFailure(error)` gives.
ANSWER END
