---
description: "a backend test review fires backend-tests"
tags: [triggering]
runs: 1
max_turns: 4
timeout_seconds: 420
allowed_tools: [Read, Glob, Grep, Skill]
---

Review this backend test. Say accept or reject, and give each reason.

```ts
// features/billing/api/__tests__/invoice.service.test.ts
it("works", async () => {
  const repo = { insert: vi.fn().mockResolvedValue({ id: "inv_1" }), findPlan: vi.fn().mockResolvedValue({ price: 4900 }) };
  const service = makeInvoiceService({ repo });
  const result = await service.createInvoice({ planId: "pro", seats: 3, couponPct: 10 });
  expect(repo.insert).toHaveBeenCalledTimes(1);
  expect(result.total).toBe(service.computeTotal(4900, 3, 10));
  expect(result.createdAt).toBeDefined();
});
```

Do not write any file.
