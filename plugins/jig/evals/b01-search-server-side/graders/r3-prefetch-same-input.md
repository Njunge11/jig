---
type: llm
focus: {source: file, path: .eval/diff-app.txt}
weight: 1
---

Judge only the one question below. The input is the git diff of the change the agent made to the app code, without its tests. If the diff has no code that decides the question, the verdict is FAIL.

Question: Does the server page prefetch `products.list` with the input it parsed from the URL, the same input the client queries with?

PASS if the page reads `searchParams`, parses them, and prefetches `products.list` with that parsed input, and the client's `useSuspenseQuery` passes an input with the same keys built from the same URL params (a deferred copy of them is fine). FAIL if the page still prefetches a fixed input such as `{}`, or the client queries with an input of a different shape.
