---
name: backend-tests
description: The quality checklist for backend tests — what an ideal TDD test looks like and what to reject. Repos on PGlite, services with fake repos, entry points (tRPC procedure, MCP tool, route handler, workflow step and function) driven through their real interfaces. Use when writing, reviewing, or planning backend tests, or creating the backend test setup (Vitest + PGlite). Keeps tests asserting observable behavior so the tests survive refactors.
---

# Backend Tests

## Review checklist

Reject the test if any item is true. This list judges each test's quality, not the suite's breadth — coverage is the implementation checklist's job: its task list states which behaviors need tests.

1. The test asserts that an **internal function was called** instead of observable behavior. Observable behavior is the response (success or thrown error), the DB state after the call, or a side effect. A side effect on an external system (item 6's fakes) is observed through the fake's record — assert its exact contents (`fakePayments.charges`), never through `toHaveBeenCalled` spy assertions.
2. The test is at the **wrong layer**. Each layer has one test setup: a repo runs on PGlite with the real schema; a service runs on an in-memory fake repo; an entry point is driven through its real interface — a tRPC procedure via `createCaller`, an MCP tool via its registered handler, a route handler via a real request, a workflow step as a plain function with injected dependencies, a workflow function through the `@workflow/vitest` plugin, which runs it in-process with its real steps.
3. The test does not have explicit **setup, invocation, or specific assertions**. Examples: no assertions, or a `toBeDefined()`-grade assertion where an exact value is knowable.
4. The test's expected values are **not computed by hand from the spec**: they are pasted from the implementation's output, or they restate the implementation's formula in the assertion.
5. The test is **non-deterministic**: it reads the clock or randomness directly instead of the injected `now()` / `uuid()`.
6. The test mocks **our own** repos or services. You may mock only systems outside ours (payments, email, OAuth).
7. The test **shares state** with other tests: no rollback transaction (repo) or no fresh fake (service).
8. The test fails the **rewrite litmus**: the test breaks if a developer rewrites the implementation (ORM → raw SQL, service restructured, auth strategy swapped).
9. The test **reads poorly**: the name does not state the action and the expected outcome, or the body contains logic (loops, conditionals). Duplication between tests is acceptable when it helps clarity.
10. The test is in the **wrong file**: the file mixes layers, or the file is not named after the source file it tests (`<source-file>.test.ts` — so `users.repo.test.ts`, `users.service.test.ts`, `users.router.test.ts`, `create-job-draft.tool.test.ts`).
11. The test verifies **more than one specified behavior**. One behavior per test; a task with several behaviors gets several tests.

## What not to do — and what to do instead

Each example shows one Review-checklist item above. Items without an example need none.

**Checklist item 1 — Do not assert an internal call. Do assert the outcome.**

```ts
// ❌ breaks on every refactor, proves nothing a user observes
expect(repo.createUser).toHaveBeenCalledWith({ name: "Acme" });

// ✅ the observable result
const user = await svc.registerUser({ name: "Acme", email: "a@example.com" });
expect(fakeRepo.users).toContainEqual(
  expect.objectContaining({ name: "Acme" }),
);
```

**Checklist item 1 — A thrown error is observable behavior too. Do assert the rejection, not only the happy path.**

```ts
// ✅ the denial is the outcome under test
const anon = createCaller(ctxFor(null));
await expect(anon.users.funnel({ period: "30d" })).rejects.toThrow(
  /unauthorized/,
);
```

**Checklist item 4 — Do not paste the implementation's output as the expected value. Do compute it by hand from the spec.**

```ts
// ❌ ran the code, copied what came out — the test now certifies whatever the code does
expect(invoice.total).toBe(1042.37);

// ❌ restates the implementation's formula — a shared misreading of the spec still passes
expect(invoice.total).toBe(FIXTURE.subtotal * 1.16);

// ✅ round input, expected value computed by hand from the spec (16% VAT)
const invoice = await svc.createInvoice({ subtotal: 100 });
expect(invoice.total).toBe(116);
```

**Checklist item 5 — Do not read the clock. Do inject it.**

```ts
// ❌ flaky at midnight, unfixable expected values
const svc = makeUsersService({ repo }); // service calls new Date() inside

// ✅ deterministic
const svc = makeUsersService({
  repo,
  now: () => FIXED_DATE,
  uuid: () => "id-1",
});
await svc.onboardUser({ userId: "u1" });
expect(fakeRepo.users).toContainEqual(
  expect.objectContaining({ onboardedAt: FIXED_DATE }),
);
```

**Checklist item 6 — Do not mock your own service in an entry-point test. Do drive the real entry.**

```ts
// ❌ tests the mock
vi.mock("../users.service");

// ✅ real router, real service, fake repo underneath
const caller = createCaller(ctxFor(session));
expect(await caller.users.funnel({ period: "30d" })).toMatchObject({
  signups: 1204,
});
```

**Checklist items 1 and 6 — A side effect on an external system is observable only in the fake's record. Do assert the record's exact contents.**

```ts
// ❌ asserts nothing about the charge — passes even if the service charged twice
const result = await svc.checkout({ cartId: "c1" });
expect(result.status).toBe("paid");

// ✅ the exact record catches a duplicate charge
await svc.checkout({ cartId: "c1" });
expect(fakePayments.charges).toEqual([{ amount: 116, cartId: "c1" }]);
```

## Test setup

When you create or extend the test setup, consult `references/test-setup.md` for the Vitest config, the PGlite setup, the fake-repo contract tests, the `createCaller` helper, and the `@workflow/vitest` plugin.
