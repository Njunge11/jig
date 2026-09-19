---
description: "backend-tests: reject a test that asserts internals and restates the formula"
tags: [obedience, backend]
runs: 1
max_turns: 8
timeout_seconds: 420
allowed_tools: [Read, Glob, Grep, Skill]
---

If a skill named `backend-tests` is available to you, invoke it with the Skill tool before you answer. If it is not available, answer without it.

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
