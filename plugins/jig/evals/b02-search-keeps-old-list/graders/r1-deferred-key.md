---
type: llm
focus: {source: file, path: .eval/diff-app.txt}
weight: 1
---

Judge only the one question below. The input is the git diff of the change the agent made to the app code, without its tests. If the diff has no code that decides the question, the verdict is FAIL.

Question: Is the `useSuspenseQuery` input a `useDeferredValue` of the nuqs state?

PASS if the component keeps `useSuspenseQuery` and passes it an input taken from `useDeferredValue(...)` of the nuqs state. FAIL if the query input is the fresh nuqs state, or `useSuspenseQuery` is replaced by `useQuery`.
