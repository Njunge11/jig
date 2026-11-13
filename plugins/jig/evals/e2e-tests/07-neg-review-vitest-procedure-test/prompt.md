---
max_turns: 6
timeout_seconds: 300
allowed_tools: [Read, Glob, Grep, Skill]
runs: 3
tags: [e2e-tests]
---

Review this Vitest test of a tRPC procedure before I merge it. Accept or reject, and give each reason in one line.

```ts
// features/billing/api/__tests__/invoice.router.test.ts
import { expect, it, vi } from "vitest";

it("works", async () => {
  const repo = {
    insert: vi.fn().mockResolvedValue({ id: "inv_1" }),
    findPlan: vi.fn().mockResolvedValue({ price: 4900 }),
  };
  const caller = makeCaller({ repo });
  const result = await caller.invoices.create({ planId: "pro", seats: 3 });
  expect(repo.insert).toHaveBeenCalledTimes(1);
  expect(result.id).toBeDefined();
});
```
