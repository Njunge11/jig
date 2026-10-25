---
type: llm
focus: {source: file, path: .eval/diff-app.txt}
weight: 1
---

Judge only the one question below. The input is the git diff of the change the agent made to the app code, without its tests. If the diff has no code that decides the question, the verdict is FAIL.

Question: does the wiring code use `@trpc/tanstack-react-query` — `createTRPCOptionsProxy` on the server and `useTRPC` from `createTRPCContext` on the client — and no `createTRPCReact` or `createHydrationHelpers` from `@trpc/react-query`?

PASS if yes. FAIL if the code imports from `@trpc/react-query`, or calls `createTRPCReact` or `createHydrationHelpers`.
