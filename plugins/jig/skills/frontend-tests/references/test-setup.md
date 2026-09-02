# Frontend test setup

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

## The provider wrapper

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

## MSW path

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

## Cache-seed path

No network at all; `useSuspenseQuery` reads the warm cache and renders immediately:

```tsx
queryClient.setQueryData(trpc.users.funnel.queryOptions({ period: "30d" }).queryKey, mockFunnel);
renderWithProviders(<FunnelCards />, { queryClient });
```

> Don't mock the `useTRPC`/`useQuery` hooks themselves — that tests the mock, not the component. Mock at the network (MSW) or seed the cache.

## Performance

**Profile first — never brute-force config changes.** The `Duration` line of every run breaks the time into phases (`environment`, `transform`, `import`, `setup`, `worker`, `tests`), and each phase maps to one configuration fix. `vitest doctor` measures the candidate configs by running the suite under each and reports the comparison — including whether the tests still pass with `isolate: false`. Change config only on what the profile or `vitest doctor` shows.

**The environment phase dominates DOM suites.** Creating the DOM costs roughly 200–500ms (`jsdom`) or 90–200ms (`happy-dom`) per test file under default isolation, because every file gets a fresh worker. The levers, from the Vitest guide:

- `isolate: false` + `pool: 'threads'` — fastest: the environment is created once per worker and files in that worker share it. The tests must not depend on a clean `window` or module state; `vitest doctor` checks this. Set it on the `ui` project only, so backend tests keep their own settings.
- `pool: 'vmThreads'` — environment per worker but a fresh `window` per file; the trade-off is VM-realm `instanceof` edge cases and less reliable memory reclaim.
- `happy-dom` is cheaper to create than `jsdom` in every setup — a lever when the environment phase still dominates.

**CI.** Shard a large suite across machines: `vitest run --reporter=blob --shard=1/3` per machine, then `vitest run --merge-reports`. Vitest splits test files, not cases. For reruns, `fsModuleCache` persists the transform cache to disk, and `NODE_COMPILE_CACHE` reuses V8 bytecode — both only pay off when the cache directory survives between runs (local, or a cached CI directory).

## Dev dependencies

Verified current (September 2026): `msw-trpc@2.0.1` peers `@trpc/server@^11` + `msw@^2`; `msw@2.15.x`; `@testing-library/jest-dom@7` (the `/vitest` entry point is real in v7).

```
vitest  jsdom
@testing-library/react  @testing-library/user-event  @testing-library/jest-dom
msw  msw-trpc
```
