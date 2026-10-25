---
type: llm
focus: {source: file, path: .eval/diff-app.txt}
weight: 1
---

Judge only the one question below. The input is the git diff of the change the agent made to the app code, without its tests. If the diff has no code that decides the question, the verdict is FAIL.

Question: is each repo method call in the service, and its `email.send`, wrapped in `trace("calling <name> to <purpose>", () => ...)`, where the name names the function called and the purpose says in words what the call is for?

PASS if every repo method call and the email send is wrapped that way. The name may be written with or without the object it is called on (`cancelOrder`, `repo.cancelOrder`, `orders.cancelOrder` for `repos.orders.cancelOrder`). The call that opens the transaction (`deps.write(...)`, `db.transaction(...)`) is not a repo method call and needs no line. FAIL if any repo method call or the email send runs without a `trace` line, or a line has no purpose clause.
