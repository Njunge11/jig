---
type: llm
focus: {source: file, path: .eval/diff-app.txt}
weight: 1
---

Judge only the one question below. The input is the git diff of the change the agent made to the app code, without its tests. If the diff has no code that decides the question, the verdict is FAIL.

Question: does the tool's body (`execute`, or the one body function it delegates to) call exactly one service method and run no query?

PASS if it calls one service method, such as `orders.getOrder`; the `permittedCaller` check does not count. FAIL if it runs a Drizzle query, uses a repository directly, or calls two or more service methods.
