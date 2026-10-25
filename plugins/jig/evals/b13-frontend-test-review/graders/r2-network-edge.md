---
type: llm
weight: 1
---

Judge only the one question below. Read only the code in the answer. If the answer has no code that decides the question, the verdict is FAIL.

Question: in the corrected test, does the real `useSuspenseQuery` run, fed either by an MSW handler at the network edge (`server.use(...)`, an `msw-trpc` handler) or by a seeded QueryClient cache (`setQueryData`)?

PASS if yes. FAIL if the corrected test still mocks `useSuspenseQuery`, `useQuery`, `useTRPC` or `@tanstack/react-query`, or gives the component no data source.
