---
name: frontend-tests
description: The quality checklist for frontend tests — what an ideal UI behavior test looks like and what to reject. Components driven through what the user sees and does (Testing Library + user-event), mocked at the network edge (MSW) or cache-seeded — never at the component's own hooks. Use when writing, reviewing, or planning frontend or component tests, or creating the UI test setup (Vitest + jsdom + MSW). Keeps tests asserting user-visible behavior so the tests survive refactors.
---

# Frontend Tests

> A test should fail because the **user-visible behavior** is wrong, not because you refactored the code.

**One harness.** The setup in the **Frontend test setup** section below is the only UI test harness. When existing tests run on a different one, those tests are wrong — write new tests on this harness, raise the migration as a step checklist, and never imitate an existing setup because it happens to pass.

## Gates

Run before a commit. Paste the output in the proof.

1. `pnpm lint` exits `0` in the app root. It proves every Review item that ends with `Gate:`; walk the other items by hand.

## Review checklist

Reject the test if any item is true. This list judges each test's quality, not the suite's breadth — coverage is the implementation checklist's job: its Behavior items state which behaviors need tests.

1. The test asserts **React state, hooks, or refs** instead of what is on screen.
2. The test asserts **a handler was called** (`toHaveBeenCalled`) instead of the on-screen outcome of the action. Gate: `pnpm lint`, rule `no-restricted-syntax (backend-tests 1)`.
3. The test asserts **CSS classes** the user cannot perceive. Gate: `pnpm lint`, rule `no-restricted-syntax (frontend-tests 3)`.
4. The test **mocks the component's own hooks** (`useTRPC`, `useQuery`), its child components, or business logic — the only mock boundaries are the network edge (MSW) and the seeded cache. Gate: `pnpm lint`, rule `no-restricted-syntax (backend-tests 6)`.
5. The test queries by **test id** where an accessible query (`getByRole`, `getByLabelText`, `getByText`) exists. Gate: `pnpm lint`, rule `no-restricted-syntax (frontend-tests 5)`.
6. The test asserts **async UI without `findBy*`** (which waits), or asserts absence without `queryBy*`.
7. A **jsdom test asserts a visual or responsive outcome** — those are Visual items, browser-checked, never jsdom tests.
8. The test fails the **litmus test**: rewriting the component's internals (state lib, data lib, markup) with behavior unchanged would break it.
9. A **stream or event fixture** takes its event order from what the author assumed instead of from the trace of one real turn the developer sent (for an eve client, `pnpm exec eve traces`; an agent never sends the turn). A fixture that streams the words before the tool result keeps the suite green and hides a client that draws every card wrong.

## A test that fails on and off

Run the test file a maximum of 3 times to confirm it. Never loop a test run (`for i in $(seq 1 15); do vitest run …`): repetition costs minutes and finds no cause. After the third run, stop and report the test's name, the failure text, and how many of the 3 runs failed. The cause is in the test or in the code: state shared between tests, a clock or a random value read directly, or a promise nobody awaits. Find it by reading, with the Review checklist above.

## What to assert

| Assert on…                          | Good? |                |
| ----------------------------------- | ----- | -------------- |
| What the user sees (text, roles)    | ✅    | behavior       |
| What the user can do (click, type)  | ✅    | behavior       |
| What appears/disappears after       | ✅    | behavior       |
| React state / hooks / refs          | ❌    | implementation |
| Handler called (`toHaveBeenCalled`) | ❌    | implementation |
| CSS classes (unless user-visible)   | ❌    | implementation |

Prefer accessible queries — `getByRole`, `getByLabelText`, `getByText`. Use `findBy*` for async (it waits); `queryBy*` to assert absence. Avoid `getByTestId` unless there is no accessible handle.

## Examples

**Loading → loaded** — assert what's on screen, not `isLoading`.

```ts
expect(screen.getByText("Loading…")).toBeVisible()
expect(await screen.findByText("1,204 signups")).toBeVisible()
```

**Interaction** — assert the outcome, not the handler.

```ts
// Wrong: asserts the wiring — passes even when the UI shows nothing
await user.selectOptions(screen.getByRole("combobox", { name: /period/i }), "30d")
expect(onPeriodChange).toHaveBeenCalledWith("30d")

// Right: asserts what the user sees after the same action
await user.selectOptions(screen.getByRole("combobox", { name: /period/i }), "30d")
expect(await screen.findByText("Last 30 days")).toBeVisible()
```

**Search / filter** — assert what's shown and what's gone.

```ts
await user.type(screen.getByRole("searchbox"), "acme")
expect(screen.getByText("Acme Ltd")).toBeVisible()
expect(screen.queryByText("Other Co")).not.toBeInTheDocument()
```

**Modal / dialog** — assert the dialog, not `setOpen`.

```ts
await user.click(screen.getByRole("button", { name: /mark paid/i }))
expect(screen.getByRole("dialog")).toBeVisible()
```

## Mocking boundary

Mock only the network edge — the tRPC/HTTP calls — with **MSW**. Never mock your own components, hooks, or business logic. The component runs for real against canned server responses, so swapping TanStack Query for anything else leaves the test green.

Two valid levels — **default to MSW**, drop to cache-seeding only for trivial render tests:

| Goal | Tool |
| --- | --- |
| Loading → success transition, **error** states, **mutations** / optimistic round-trips | **MSW** at the network edge (`msw-trpc` for typed handlers) |
| Pure "renders correct UI given this data" / interaction outcome, no fetch behavior under test | **Seed the cache** (`queryClient.setQueryData`), no MSW |

## Test setup

When you create or extend the UI test setup, or the suite runs slowly, use the **Frontend test setup** section below for the Vitest `ui` project config, the provider render wrapper, the MSW server lifecycle, the cache-seed path, and the performance levers (profile first, then `vitest doctor` — never brute-force config changes).

`references/sources.md` maps each rule to the doc that grounds it — load it only when a rule's ground is questioned.

## Frontend test setup

Use one Vitest config with a `ui` project beside the `backend` project (Vitest **`projects`** — current through Vitest 4; the `workspace` file is deprecated since 3.2). Put the tests in each feature's `ui/__tests__/`. Run them with `vitest --project ui`.

```ts
// vitest.config.ts — the ui project
{
  extends: true,
  test: {
    name: "ui",
    environment: "jsdom", // happy-dom is faster; jsdom is more complete — default to jsdom
    include: ["features/**/ui/__tests__/**/*.test.tsx"],
    setupFiles: ["./test/setup.ui.ts"],
  },
}
```

`test/setup.ui.ts` imports `@testing-library/jest-dom/vitest` and starts the MSW server (below). The backend project's setup lives in the `backend-tests` skill.

### The provider wrapper

Components read data through `useSuspenseQuery(trpc.x.queryOptions(...))` via `useTRPC()`. Both mock levels render through the **same wrapper** — a test QueryClient (`retry: false`) + the tRPC provider:

```tsx
// test/render.tsx
export function renderWithProviders(ui, { queryClient = makeTestClient() } = {}) {
  const trpcClient = makeTRPCClient(); // points at the URL MSW intercepts
  return render(
    <QueryClientProvider client={queryClient}>
      <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>{ui}</TRPCProvider>
    </QueryClientProvider>
  );
}
const makeTestClient = () =>
  new QueryClient({ defaultOptions: { queries: { retry: false } } }); // no retries → fast error tests
```

### MSW path

Handlers are type-safe with `msw-trpc`; the server lifecycle lives in the setup file:

```ts
// test/msw.ts
import { setupServer } from "msw/node";
import { createTRPCMsw, httpLink } from "msw-trpc"; // httpLink from msw-trpc, not @trpc/client
export const trpcMsw = createTRPCMsw<AppRouter>({
  links: [httpLink({ url: "http://localhost:3000/api/trpc" })], // same URL the test tRPC client targets
});
export const server = setupServer();

// test/setup.ui.ts
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// in a test
server.use(trpcMsw.users.funnel.query(() => ({ signups: 1204, /* … */ })));
```

### Cache-seed path

No network at all; `useSuspenseQuery` reads the warm cache and renders immediately:

```tsx
queryClient.setQueryData(trpc.users.funnel.queryOptions({ period: "30d" }).queryKey, mockFunnel);
renderWithProviders(<FunnelCards />, { queryClient });
```

> Don't mock the `useTRPC`/`useQuery` hooks themselves — that tests the mock, not the component. Mock at the network (MSW) or seed the cache.

### Performance

**Profile first — never brute-force config changes.** The `Duration` line of every run breaks the time into phases (`environment`, `transform`, `import`, `setup`, `worker`, `tests`), and each phase maps to one configuration fix. `vitest doctor` measures the candidate configs by running the suite under each and reports the comparison — including whether the tests still pass with `isolate: false`. Change config only on what the profile or `vitest doctor` shows.

**The environment phase dominates DOM suites.** Creating the DOM costs roughly 200–500ms (`jsdom`) or 90–200ms (`happy-dom`) per test file under default isolation, because every file gets a fresh worker. The levers, from the Vitest guide:

- `isolate: false` + `pool: 'threads'` — fastest: the environment is created once per worker and files in that worker share it. The tests must not depend on a clean `window` or module state; `vitest doctor` checks this. Set it on the `ui` project only, so backend tests keep their own settings.
- `pool: 'vmThreads'` — environment per worker but a fresh `window` per file; the trade-off is VM-realm `instanceof` edge cases and less reliable memory reclaim.
- `happy-dom` is cheaper to create than `jsdom` in every setup — a lever when the environment phase still dominates.

**CI.** Shard a large suite across machines: `vitest run --reporter=blob --shard=1/3` per machine, then `vitest run --merge-reports`. Vitest splits test files, not cases. For reruns, `fsModuleCache` persists the transform cache to disk, and `NODE_COMPILE_CACHE` reuses V8 bytecode — both only pay off when the cache directory survives between runs (local, or a cached CI directory).

### Dev dependencies

Verified current (September 2026): `msw-trpc@2.0.1` peers `@trpc/server@^11` + `msw@^2`; `msw@2.15.x`; `@testing-library/jest-dom@7` (the `/vitest` entry point is real in v7).

```
vitest  jsdom
@testing-library/react  @testing-library/user-event  @testing-library/jest-dom
msw  msw-trpc
```
