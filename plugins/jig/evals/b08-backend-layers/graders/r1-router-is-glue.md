---
type: llm
focus: {source: file, path: .eval/diff-app.txt}
weight: 1
---

Judge only the one question below. The input is the git diff of the change the agent made to the app code, without its tests. If the diff has no code that decides the question, the verdict is FAIL.

Question: does the `orders.cancel` procedure's handler call exactly one service method and run no query and no business step of its own?

PASS if the handler calls one service method. Building the service with its factory, mapping its result or error to the client, and binding the transaction mechanism for the service (such as `write: (run) => ctx.db.transaction((tx) => run(makeOrdersRepo(tx)))`) are composition and do not count. FAIL if the handler runs a Drizzle query, writes the status change or the releases itself (inside a transaction or not), or calls two or more service methods.
