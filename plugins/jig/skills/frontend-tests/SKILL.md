---
name: frontend-tests
description: The quality checklist for frontend tests — what an ideal UI behavior test looks like and what to reject. Components driven through what the user sees and does (Testing Library + user-event), mocked at the network edge (MSW) or cache-seeded — never at the component's own hooks. Use when writing, reviewing, or planning frontend or component tests, or creating the UI test setup (Vitest + jsdom + MSW). Keeps tests asserting user-visible behavior so the tests survive refactors.
---

# Frontend Tests

> A test should fail because the **user-visible behavior** is wrong, not because you refactored the code.

**One harness.** The setup in `references/test-setup.md` is the only UI test harness. When existing tests run on a different one, those tests are wrong — write new tests on this harness, raise the migration as a step checklist, and never imitate an existing setup because it happens to pass.

## Review checklist

Reject the test if any item is true. This list judges each test's quality, not the suite's breadth — coverage is the implementation checklist's job: its Behavior items state which behaviors need tests.

1. The test asserts **React state, hooks, or refs** instead of what is on screen.
2. The test asserts **a handler was called** (`toHaveBeenCalled`) instead of the on-screen outcome of the action.
3. The test asserts **CSS classes** the user cannot perceive.
4. The test **mocks the component's own hooks** (`useTRPC`, `useQuery`), its child components, or business logic — the only mock boundaries are the network edge (MSW) and the seeded cache.
5. The test queries by **test id** where an accessible query (`getByRole`, `getByLabelText`, `getByText`) exists.
6. The test asserts **async UI without `findBy*`** (which waits), or asserts absence without `queryBy*`.
7. A **jsdom test asserts a visual or responsive outcome** — those are Visual items, browser-checked, never jsdom tests.
8. The test fails the **litmus test**: rewriting the component's internals (state lib, data lib, markup) with behavior unchanged would break it.

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

When you create or extend the UI test setup, or the suite runs slowly, consult `references/test-setup.md` for the Vitest `ui` project config, the provider render wrapper, the MSW server lifecycle, the cache-seed path, and the performance levers (profile first, then `vitest doctor` — never brute-force config changes).

`references/sources.md` maps each rule to the doc that grounds it — load it only when a rule's ground is questioned.
