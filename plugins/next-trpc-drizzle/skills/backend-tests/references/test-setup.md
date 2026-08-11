# Backend test setup

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

## Repo tests — PGlite

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

## Service tests — fake repo

Use no DB. Assert the returned values and the data persisted to the fake. The #5 example in `SKILL.md` shows the setup.

A fake is code too. Give each fake repo a contract test. The contract test runs the same assertions against the fake and against the PGlite-backed real repo. Then the fake cannot drift from the behavior it substitutes for.

## Router tests — createCallerFactory

Create the caller once in a test helper: `const createCaller = createCallerFactory(appRouter)` (the docs-preferred primitive; `router.createCaller` remains valid). Then do these steps per test. Build a context with a test session. Call procedures. Assert the response or the thrown error. The #6 example in `SKILL.md` shows the pattern.

## Workflow tests — steps plain, workflows via @workflow/vitest

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

## Dev dependencies

```
vitest  @vitest/coverage-v8  @electric-sql/pglite
```

Add `@workflow/vitest` when the feature contains a workflow function.
