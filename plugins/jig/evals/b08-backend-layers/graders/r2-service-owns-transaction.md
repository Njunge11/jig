---
type: llm
focus: {source: file, path: .eval/diff-app.txt}
weight: 1
---

Judge only the one question below. The input is the git diff of the change the agent made to the app code, without its tests. If the diff has no code that decides the question, the verdict is FAIL.

Question: are the status change and the releases written in the service, as the steps of one transaction?

PASS if the two repo calls are written in service code that runs inside one transaction: inside `.transaction(...)` in the service, or inside the function the service hands to an injected dependency such as `deps.write(...)` (an inline arrow or a named function). The entry may bind that dependency to `db.transaction`; that binding is composition. FAIL if the two repo calls are written in the router or in one repository method that opens the transaction, or no transaction wraps them both.
