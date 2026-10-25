---
type: llm
focus: {source: file, path: .eval/diff-app.txt}
weight: 1
---

Judge only the one question below. The input is the git diff of the change the agent made to the app code, without its tests. If the diff has no code that decides the question, the verdict is FAIL.

Question: when the service answers `{ ok: false }` with the reason `notFound` or `hasOrders`, does the handler return (not throw) a result with `isError: true` and a `content` text block?

PASS if yes for both reasons. One branch that returns such a result for every `ok: false` answer, with a message looked up by the reason, covers both reasons. FAIL if either reason is thrown, or its result lacks `isError: true` or a text block.
