---
type: llm
weight: 2
---

PASS only if the review rejects the test because it mocks the component's own data hook (that tests the mock), and the corrected test mocks at the network edge with MSW (msw-trpc handlers) or seeds the QueryClient cache, renders through a provider wrapper, and asserts through what the user sees (Testing Library queries such as `getByText`/`findByText`/role queries), not through a CSS class selector.

FAIL if the corrected test still mocks `useSuspenseQuery`, `useQuery` or `useTRPC`.
