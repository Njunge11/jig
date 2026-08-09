---
name: backend-tests
description: The TDD loop and the test-quality guidelines for backend work. Repos on PGlite, services with fake repos, routers via tRPC createCaller. Use when implementing backend features test-first, writing or reviewing backend tests, or wiring the backend test harness. Keeps tests asserting observable behavior so the tests survive refactors.
---

# Backend Tests

The builder builds backend work one behavior at a time, test-first. The suite stays green between behaviors.

## The test list

The Behaviors section of the feature's checklist is the test list. The list is immutable. You check items off. You never add, remove, or reword items.

- If you discover a missing case during the loop, write the extra test. The checklist stays unchanged.
- If you discover something that changes the feature's scope, record it in the deviations note of the handoff. Do not include it silently.
- If you work without a checklist, write the behavior list first: the basic case, edge cases, error cases, and ways existing behavior must not break. Then run the same loop against the list.

## The loop

Do these steps for each behavior, in order. Never write all the tests up front. The first implementation decision invalidates the speculative remaining tests.

1. **Red.** Turn the behavior into one real, runnable test. Run the test to see it fail. A test that passes before the implementation exists does not test the new behavior.
2. **Self-check.** Check the test against each item of the [Review checklist](#review-checklist) below. Name each item that is true, fix the test, and check again. A test that fails the checklist breaks on refactors and proves nothing.
3. **Green.** Change the **code** until this test and all previous tests pass. Do nothing more. Do not refactor yet. Never make the tests pass by a change to a test. Do not edit assertions. Do not delete or skip tests. The only permitted test edit here is a fix to a test that contradicts the spec, per checklist #4.
4. **Refactor (optional).** Now improve the design, but only as far as this feature needs. Duplication alone is not a reason to extract. Tests stay green through this step.
5. **Commit.** Make one commit per behavior. Never batch several behaviors into one commit. The message follows the enforced convention of the repo. With commitlint present, that convention is Conventional Commits (`feat(scope): subject`). Message language: imperative, active voice, one idea per sentence, ≤20 words per sentence, simple tenses, no self-praise adjectives. State what changed, not how good it is. The git log becomes the step-by-step record of the feature. **Never bypass hooks** (`--no-verify` is banned). A failing pre-commit hook is part of the work. Diagnose and fix the hook failure. Hooks can auto-fix and re-stage files (Prettier/ESLint). That result is expected, not an error.
6. **Check the behavior off.** Then take the next behavior. The feature is done when the list is empty.

## Review checklist

Reject the test if any item is true:

1. The test asserts that an **internal function was called** instead of observable behavior. Observable behavior is the API response (success or thrown error), the DB state after the call, or a side effect.
2. The test is at the **wrong layer**. Wrong layers: a repo not on PGlite (real schema), a service not on an in-memory fake repo, a router not through `createCaller` with a built context.
3. The test does not have explicit **setup, invocation, or specific assertions**. Examples: no assertions, or a `toBeDefined()`-grade assertion where an exact value is knowable.
4. The test uses expected values **pasted from the implementation's output**, not values derived from the spec or a fixture.
5. The test is **non-deterministic**: it reads the clock or randomness directly instead of the injected `now()` / `uuid()`.
6. The test mocks **our own** repos or services. You may mock only systems outside ours (payments, email, OAuth).
7. The test **shares state** with other tests: no rollback transaction (repo) or no fresh fake (service).
8. The test fails the **rewrite litmus**: the test breaks if a developer rewrites the implementation (ORM → raw SQL, service restructured, auth strategy swapped).
9. The test **reads poorly**: the name does not state the action and the expected outcome, or the body contains logic (loops, conditionals). Duplication between tests is acceptable when it helps clarity.
10. The test is in the **wrong file**: the file mixes layers, or the file is not named after the source file it tests (`<feature>.repo.test.ts` / `<feature>.service.test.ts` / `<feature>.router.test.ts`).

## What not to do — and what to do instead

**#1 — Do not assert an internal call. Do assert the outcome.**

```ts
// ❌ breaks on every refactor, proves nothing a user observes
expect(repo.createUser).toHaveBeenCalledWith({ name: "Acme" });

// ✅ the observable result
const user = await svc.registerUser({ name: "Acme", email: "a@example.com" });
expect(fakeRepo.users).toContainEqual(
  expect.objectContaining({ name: "Acme" }),
);
```

**#4 — Do not paste the implementation's output as the expected value. Do derive it from the spec.**

```ts
// ❌ ran the code, copied what came out — the test now certifies whatever the code does
expect(invoice.total).toBe(1042.37);

// ✅ the spec says: subtotal + 16% VAT
expect(invoice.total).toBe(FIXTURE.subtotal * 1.16);
```

**#6 — Do not mock your own service in a router test. Do drive the real router.**

```ts
// ❌ tests the mock
vi.mock("../users.service");

// ✅ real router, real service, fake repo underneath
const caller = createCaller(ctxFor(session));
expect(await caller.users.funnel({ period: "30d" })).toMatchObject({
  signups: 1204,
});
```

**#5 — Do not read the clock. Do inject it.**

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

**#1 — Do not skip the unhappy paths. Do test errors and denials as behavior.**

```ts
// ✅ a rejection is observable behavior too
const anon = createCaller(ctxFor(null));
await expect(anon.users.funnel({ period: "30d" })).rejects.toThrow(
  /unauthorized/,
);
```

## Harness

Use one Vitest config, a `backend` project, and the node environment. Put the tests in each feature's `api/__tests__/` and `db/__tests__/`. Run the tests with `vitest --project backend`.

**One test file per source file, named after it** — `<feature>.repo.test.ts`, `<feature>.service.test.ts`, `<feature>.router.test.ts`. Never mix layers in one file. Each layer has its own harness (PGlite / fake repo / `createCaller`). A mixed file mixes the setups together.

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

### Service tests — fake repo

Use no DB. Assert the returned values and the data persisted to the fake. The #5 example above shows the setup.

A fake is code too. Give each fake repo a contract test. The contract test runs the same assertions against the fake and against the PGlite-backed real repo. Then the fake cannot drift from the behavior it substitutes for.

### Router tests — createCallerFactory

Create the caller once in a test helper: `const createCaller = createCallerFactory(appRouter)` (the docs-preferred primitive; `router.createCaller` remains valid). Then do these steps per test. Build a context with a test session. Call procedures. Assert the response or the thrown error. The #6 example above shows the pattern.

### Dev dependencies

```
vitest  @vitest/coverage-v8  @electric-sql/pglite
```
