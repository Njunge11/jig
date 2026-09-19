---
type: llm
weight: 1
---

Judge only the one point below. Ignore every other quality of the answer. Do not fail the answer for a fault that this point does not name.

PASS if the corrected test mocks at the network edge with MSW (msw-trpc handlers) or seeds the QueryClient cache, and renders through a provider wrapper. FAIL if the corrected test still mocks `useSuspenseQuery`, `useQuery` or `useTRPC`.
