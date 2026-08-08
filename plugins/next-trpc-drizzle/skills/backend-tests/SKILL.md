---
name: backend-tests
description: The TDD loop and test-quality guidelines for backend work — repos on PGlite, services with fake repos, routers via tRPC createCaller. Use when implementing backend features test-first, writing or reviewing backend tests, or wiring the backend test harness. Keeps tests asserting observable behavior so they survive refactors.
---

# Backend Tests

How backend work gets built: one behavior at a time, test-first, always green between behaviors.

## The test list

The feature's checklist Behaviors section is the test list. It is immutable — you check items off; you never add, remove, or reword them.

- If you discover a missing case mid-loop, write the extra test; the checklist stays untouched.
- If you discover something that changes the feature's scope, record it in the handoff's deviations note; don't absorb it silently.
- If working without a checklist, write the behavior list first — basic case, edge cases, error cases, ways existing behavior must not break — then run the same loop against it.

## The loop

For each behavior, in order — never all the tests up front (the first implementation decision invalidates the speculative rest):

1. **Red.** Turn the behavior into one real, runnable test — and run it to see it fail. A test that passes before the implementation exists isn't testing the new behavior.
2. **Self-check.** Walk the [Review checklist](#review-checklist) below item by item against the test. Name any item that is true, fix the test, re-check. A test that trips the checklist breaks on refactors while proving nothing.
3. **Green.** Change the **code** until this test and all previous tests pass — nothing more, no refactoring yet. Never get to green by changing the test — no edited assertions, no deleted or skipped tests. The only legitimate test edit here is fixing a test that contradicts the spec, per checklist #4.
4. **Refactor (optional).** Now improve the design — only as far as this feature needs; duplication alone is not a reason to extract. Tests stay green throughout.
5. **Commit.** One commit per behavior — never several batched into one. Message follows the repo's enforced convention — with commitlint present that's Conventional Commits (`feat(scope): subject`). Message language: imperative, active voice, one idea per sentence, ≤20 words per sentence, simple tenses, no self-praise adjectives — state what changed, not how good it is. The git log becomes the step-by-step record of the feature. **Never bypass hooks** (`--no-verify` is banned): a failing pre-commit hook is part of the work — diagnose and fix it. Hooks may auto-fix and re-stage files (Prettier/ESLint); that's expected, not an error.
6. **Check the behavior off.** Then take the next one. The feature is done when the list is empty.

## Review checklist

Reject the test if any is true:

1. Asserts that an **internal function was called** instead of observable behavior — the API response (success or thrown error), the DB state after the call, or a side effect.
2. Tests at the **wrong layer**: repo not on PGlite (real schema), service not on an in-memory fake repo, router not through `createCaller` with a built context.
3. Missing explicit **setup, invocation, or specific assertions** — assertion-free, or `toBeDefined()`-grade where an exact value is knowable.
4. Expected values **pasted from the implementation's output** instead of derived from the spec or a fixture.
5. **Non-deterministic**: reads the clock or randomness directly instead of injected `now()` / `uuid()`.
6. Mocks **our own** repos or services — only systems outside ours (payments, email, OAuth) may be mocked.
7. **Shares state** with other tests — no rollback transaction (repo) or fresh fake (service).
8. Fails the **rewrite litmus**: would break if the implementation were rewritten (ORM → raw SQL, service restructured, auth strategy swapped).
9. **Reads poorly**: the name doesn't state the action and expected outcome, or the body contains logic (loops, conditionals) — duplication between tests is acceptable when it aids clarity.
10. **Wrong file**: the test sits in a file that mixes layers or isn't named after the source file it tests (`<feature>.repo.test.ts` / `<feature>.service.test.ts` / `<feature>.router.test.ts`).

## What not to do — and what to do instead

**#1 — Don't assert an internal call. Do assert the outcome.**

```ts
// ❌ breaks on every refactor, proves nothing a user observes
expect(repo.createUser).toHaveBeenCalledWith({ name: "Acme" });

// ✅ the observable result
const user = await svc.registerUser({ name: "Acme", email: "a@example.com" });
expect(fakeRepo.users).toContainEqual(
  expect.objectContaining({ name: "Acme" }),
);
```

**#4 — Don't paste the implementation's output as the expected value. Do derive it from the spec.**

```ts
// ❌ ran the code, copied what came out — the test now certifies whatever the code does
expect(invoice.total).toBe(1042.37);

// ✅ the spec says: subtotal + 16% VAT
expect(invoice.total).toBe(FIXTURE.subtotal * 1.16);
```

**#6 — Don't mock your own service in a router test. Do drive the real router.**

```ts
// ❌ tests the mock
vi.mock("../users.service");

// ✅ real router, real service, fake repo underneath
const caller = createCaller(ctxFor(session));
expect(await caller.users.funnel({ period: "30d" })).toMatchObject({
  signups: 1204,
});
```

**#5 — Don't read the clock. Do inject it.**

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

**#1 — Don't skip the unhappy paths. Do test errors and denials as behavior.**

```ts
// ✅ a rejection is observable behavior too
const anon = createCaller(ctxFor(null));
await expect(anon.users.funnel({ period: "30d" })).rejects.toThrow(
  /unauthorized/,
);
```

## Harness

One Vitest config, `backend` project, node environment. Tests live in each feature's `api/__tests__/` and `db/__tests__/`. Run with `vitest --project backend`.

**One test file per source file, named after it** — `<feature>.repo.test.ts`, `<feature>.service.test.ts`, `<feature>.router.test.ts`. Never mix layers in one file: each layer has its own harness (PGlite / fake repo / `createCaller`), and a mixed file tangles their setups.

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

Real Postgres compiled to WASM, in-process. No Docker.

- **Load the schema with `drizzle-kit push`, not migration files** — push the imported schema objects into the PGlite instance at suite start (in `test/setup.backend.ts`), so FKs and constraints are real and tests are decoupled from any `drizzle/` folder.
- **Isolate with a rollback transaction** (~2–4 ms/test vs ~40–60 ms truncate-and-reseed):

```ts
await db.transaction(async (tx) => {
  const repo = makeUsersRepo(tx);
  const user = await repo.createUser({ name: "Acme", email: "a@example.com" });
  expect(await repo.getUserById(user.id)).toMatchObject({ name: "Acme" });
  throw ROLLBACK; // discard — next test starts clean
});
```

- When a test must actually commit (asserting across committed transactions), snapshot the freshly-pushed empty DB once and restore per test instead.

### Service tests — fake repo

No DB. Assert returned values and what was persisted to the fake — the #5 example above shows the setup.

A fake is code too: give each fake repo a contract test that runs the same assertions against both the fake and the PGlite-backed real repo, so the fake can't drift from the behavior it stands in for.

### Router tests — createCallerFactory

Create the caller once in a test helper — `const createCaller = createCallerFactory(appRouter)` (the docs-preferred primitive; `router.createCaller` remains valid) — then per test: build a context with a test session, call procedures, assert the response or the thrown error. The #6 example above shows the pattern.

### Dev dependencies

```
vitest  @vitest/coverage-v8  @electric-sql/pglite
```
