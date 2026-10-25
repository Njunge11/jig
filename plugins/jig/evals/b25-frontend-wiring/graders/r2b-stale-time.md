---
type: llm
focus: {source: file, path: .eval/diff-app.txt}
weight: 1
---

Judge only the one question below. The input is the git diff of the change the agent made to the app code, without its tests. If the diff has no code that decides the question, the verdict is FAIL.

Question: Does the QueryClient factory set a default `staleTime` above zero for queries?

PASS if the one factory that makes the QueryClient sets `defaultOptions.queries.staleTime` to a value above 0: a number, an expression such as `60 * 1000`, or a named constant whose value above 0 the diff shows. FAIL if the factory sets no `staleTime`, sets it to 0, or uses a constant whose value the diff does not show.
