---
name: backend-tests
description: The quality checklist for backend tests — what an ideal TDD test looks like and what to reject. Repos on PGlite, services with fake repos, entry points (tRPC procedure, MCP tool, eve agent tool, route handler, workflow step and function) driven through their real interfaces. Use when writing, reviewing, or planning backend tests, or creating the backend test setup (Vitest + PGlite). Keeps tests asserting observable behavior so the tests survive refactors.
---

# Backend Tests

## Gates

Run before a commit. Paste the output in the proof.

1. `pnpm lint` exits `0` in the app root. It proves every Review item that ends with `Gate:`; walk the other items by hand.

## Review checklist

Reject the test if any item is true. This list judges each test's quality, not the suite's breadth — coverage is the implementation checklist's job: its task list states which behaviors need tests.

1. The test asserts that an **internal function was called** instead of observable behavior. Observable behavior is the response (success or thrown error), the DB state after the call, or a side effect. A side effect on an external system (item 6's fakes) is observed through the fake's record — assert its exact contents (`fakePayments.charges`), never through `toHaveBeenCalled` spy assertions. Gate: `pnpm lint`, rule `no-restricted-syntax (backend-tests 1)`.
2. The test is at the **wrong layer**. Each layer has one test setup: a repo runs on PGlite with the real schema; a service runs on an in-memory fake repo; an entry point is driven through its real interface — a tRPC procedure via `createCaller`, an MCP tool via its registered handler, an eve agent tool via one eval that runs the compiled build with a scripted mock model (a Vitest import of the tool misses what the eve compiler breaks), a route handler via a real request, a workflow step as a plain function with injected dependencies, a workflow function through the `@workflow/vitest` plugin, which runs it in-process with its real steps.
3. The test does not have explicit **setup, invocation, or specific assertions**. Examples: no assertions, or a `toBeDefined()`-grade assertion where an exact value is knowable. Gate for the `toBeDefined` case: `pnpm lint`, rule `no-restricted-syntax (backend-tests 3)`; walk the rest by hand.
4. The test's expected values are **not computed by hand from the spec**: they are pasted from the implementation's output, or they restate the implementation's formula in the assertion.
5. The test is **non-deterministic**: it reads the clock or randomness directly instead of the injected `now()` / `uuid()`. Gate: `pnpm lint`, rule `no-restricted-syntax (backend-tests 5)`.
6. The test mocks **our own** repos or services. You may mock only systems outside ours (payments, email, OAuth). Gate: `pnpm lint`, rule `no-restricted-syntax (backend-tests 6)`.
7. The test **shares state** with other tests: no rollback transaction (repo) or no fresh fake (service).
8. The test fails the **rewrite litmus**: the test breaks if a developer rewrites the implementation (ORM → raw SQL, service restructured, auth strategy swapped).
9. The test **reads poorly**: the name does not state the action and the expected outcome, or the body contains logic (loops, conditionals). Duplication between tests is acceptable when it helps clarity. Gate for the logic-in-the-body clause: `pnpm lint`, rule `no-restricted-syntax (backend-tests 9)`; walk the rest by hand.
10. The test is in the **wrong file**: the file mixes layers, or the file is not named after the source file it tests (`<source-file>.test.ts` — so `users.repo.test.ts`, `users.service.test.ts`, `users.router.test.ts`, `create-job-draft.tool.test.ts`).
11. The test verifies **more than one specified behavior**. One behavior per test; a task with several behaviors gets several tests.
12. The test targets **code that is not ours or has no behavior of its own**: a third-party library's correctness (Zod parsing, Drizzle SQL generation), a trivial pass-through, or a private helper already covered through its public API.
13. The test asserts **behavior that lives in the fake**, not in the code under test: the fake re-implements production logic (filtering, stamping, ordering), and the assertion observes that logic. A stateful fake lives in `<source>.repo.fake.ts` beside the real repo, with a contract test that proves it against the real implementation — never inline in one test file.
14. A **statement-budget test** runs through a fake repo or a mocked client instead of the real database, or asserts a bound (`toBeLessThan`) where the exact count is knowable, or the count it asserts was read off the implementation instead of listed from the behavior (item 4). Gate for the `toBeLessThan` clause: `pnpm lint`, rule `no-restricted-syntax (backend-tests 14)`; walk the rest by hand.
15. An entry-point call has no **call-trace test**, or the test asserts a substring of the block instead of every line in call order, or runs with `TRACE_LOG` unset so the block is empty.

## A test that fails on and off

Run the test file a maximum of 3 times to confirm it. Never loop a test run (`for i in $(seq 1 15); do vitest run …`): repetition costs minutes and finds no cause. After the third run, stop and report the test's name, the failure text, and how many of the 3 runs failed. The cause is in the test or in the code: state shared between tests, a clock or a random value read directly, or a promise nobody awaits. Find it by reading, with the Review checklist above.

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

**Checklist item 13 — Do not assert what the fake does. Do assert what the code under test does.**

```ts
// ❌ the fake filters deleted rows itself — the test stays green even when
// the real repo forgets its isNull(deletedAt) filter
const fakeRepo = {
  rows: [{ id: "j1", deletedAt: null as Date | null }],
  async softDeleteJob(id: string) {
    const row = this.rows.find((r) => r.id === id);
    if (row) row.deletedAt = DELETED_AT;             // ← production logic
    return row?.id ?? null;
  },
  async getJob(id: string) {
    const row = this.rows.find((r) => r.id === id);
    return row && !row.deletedAt ? toJob(row) : null; // ← production logic
  },
};
await svc.deleteJob("j1", COMPANY_ID);
expect((await svc.getJob("j1", COMPANY_ID)).status).toBe("notFound");

// ✅ the service's own behavior: it maps the repo's answer to the outcome
const svc = makeJobsService({ repo: { ...reads, softDeleteJob: async () => "j1" } });
expect(await svc.deleteJob("j1", COMPANY_ID)).toEqual({ status: "deleted" });
// The filtering itself is a repo behavior. The repo test proves it on PGlite.
```

**Checklist item 12 — Do not test the library. Do test our rule, through our entry point.**

```ts
// ❌ tests Zod, not our code
expect(() => schema.parse({ email: 123 })).toThrow();

// ✅ our validation contract, driven through the real interface
await expect(caller.users.register({ email: "no-at-sign" })).rejects.toThrow(
  /invalid email/,
);
```

**Checklist item 14 — Statement budget. Count the statements the behavior needs, then assert that the call runs exactly that many.**

The budget is the one test that fails when a call grows a query nobody needs. It runs at the entry-point layer on the real database, with the counter that the "Statement counter" section below describes.

```ts
// ❌ a bound hides growth, and a fake counts nothing
expect(statementCount()).toBeLessThan(10);

// ✅ listed from the behavior: the gate reads the membership (1),
//    the update writes the draft and returns it (1), the review reads
//    the draft's places (1) — three statements, no more
statementCount.reset();
await caller.submitDetails({ companyId, draftId, employmentType: "Full-time" });
expect(statementCount()).toBe(3);
```

The expected count is written before the code, from the statements the task lists (`backend-standards`, "Give every entry-point call a statement budget"). When the count must rise, the task names the behavior that needs the extra statement, and the test's comment names it too.

## Test setup

When you create or extend the test setup, the **Backend test setup** section below holds the Vitest config, the PGlite setup, the fake-repo contract tests, the `createCaller` helper, and the `@workflow/vitest` plugin.

## Backend test setup

Use one Vitest config, a `backend` project, and the node environment. Put the tests in each feature's `api/__tests__/` and `db/__tests__/`. Run the tests with `vitest --project backend`.

**One test file per source file, named after it** — `<source-file>.test.ts`. Never mix layers in one file. Each layer has its own setup (PGlite / fake repo / real entry interface). A mixed file mixes the setups together.

```ts
// vitest.config.ts — the backend project
{
  extends: true,
  test: {
    name: "backend",
    environment: "node",
    include: ["features/**/{api,db}/__tests__/**/*.test.ts"],
    setupFiles: ["./test/setup.backend.ts"],
  },
}
```

### Repo tests — PGlite

PGlite is real Postgres compiled to WASM, and it runs in-process. It does not need Docker.

- **Load the schema with `drizzle-kit push`, not migration files.** Push the imported schema objects into the PGlite instance at suite start (in `test/setup.backend.ts`). Then FKs and constraints are real, and the tests do not depend on any `drizzle/` folder.
- **Isolate with a rollback transaction** (~2–4 ms/test vs ~40–60 ms truncate-and-reseed):

```ts
await db.transaction(async (tx) => {
  const repo = makeUsersRepo(tx);
  const user = await repo.createUser({ name: "Acme", email: "a@example.com" });
  expect(await repo.getUserById(user.id)).toMatchObject({ name: "Acme" });
  throw ROLLBACK; // discard — next test starts clean
});
```

- When a test must actually commit (it asserts across committed transactions), snapshot the freshly-pushed empty DB once and restore per test instead.

#### Statement counter

A statement-budget test (`backend-tests` Review item 14) reads how many statements one call ran. Count them where every statement passes: the Drizzle `logger` option. Drizzle calls `logQuery` once per statement it sends, so a logger that increments a counter is exact and costs nothing.

```ts
// test/statement-counter.ts
import type { Logger } from "drizzle-orm/logger";

let count = 0;

export const countingLogger: Logger = {
  logQuery() {
    count += 1;
  },
};

export function statementCount(): number {
  return count;
}
statementCount.reset = () => {
  count = 0;
};
```

Pass `countingLogger` to `drizzle(client, { logger: countingLogger })` when the test setup builds the PGlite db, and call `statementCount.reset()` in `beforeEach`. Statements inside a transaction count the same way. The transaction markers (`BEGIN`, `COMMIT`, `ROLLBACK`) do not pass through the logger, so a budget lists only the statements the call runs. Verified on drizzle-orm with the PGlite driver: two plain statements count 2; one statement inside a transaction counts 1, committed or rolled back.

### Service tests — fake repo

Use no DB. Assert the returned values and the data persisted to the fake.

A fake is code too. Give each fake repo a contract test. The contract test runs the same assertions against the fake and against the PGlite-backed real repo. Then the fake cannot drift from the behavior it substitutes for.

### Router tests — createCallerFactory

Create the caller once in a test helper: `const createCaller = createCallerFactory(appRouter)`. Then do these steps per test. Build a context with a test session. Call procedures. Assert the response or the thrown error.

### The call trace test

One test per entry-point call, in that entry's test file. Set `TRACE_LOG=1` for the test (`vi.stubEnv`, undone in `afterEach`), pass a `log` that collects the block, call the entry once on the real database, and assert the block: one line per call the entry makes, in call order, each as `<indent>calling <name> to <purpose>. <result>. took <seconds> s`, and under each call the `query <verb> <table>` lines the client prints for it, with the seconds matched as `\d+\.\d{3}`. Assert the whole list, so a call that goes missing or moves fails the test. The lines are the checklist's call-trace task (`implementation-planner`).

### Workflow tests — steps plain, workflows via @workflow/vitest

- A workflow step is a plain function: unit test it like any other function, with its dependencies injected. Without the workflow compiler, the `"use step"` directive is a no-op — no plugin, no config.
- A workflow function runs through the `@workflow/vitest` plugin. The plugin compiles the workflow directives and executes the workflow entirely in-process, with its real steps. `vi.mock()` does not work inside workflow functions — only inside step functions — so determinism comes from the dependencies the steps take injected.

```ts
// vitest config for workflow integration tests
import { workflow } from "@workflow/vitest";

export default defineConfig({
  plugins: [workflow()],
  test: {
    include: ["**/*.integration.test.ts"],
    testTimeout: 60_000,
  },
});
```

### Dev dependencies

```
vitest  @vitest/coverage-v8  @electric-sql/pglite
```

Add `@workflow/vitest` when the feature contains a workflow function.
