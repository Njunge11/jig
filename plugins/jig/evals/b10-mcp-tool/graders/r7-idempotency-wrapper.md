---
type: llm
focus: {source: file, path: .eval/diff-app.txt}
weight: 1
---

Judge only the one question below. The input is the git diff of the change the agent made to the app code, without its tests. If the diff has no code that decides the question, the verdict is FAIL.

Question: is `delete_product` registered through the app's idempotency wrapper (`registerIdempotentTool` from `lib/mcp/idempotent.ts`), with no idempotency key in its input schema?

PASS if the tool is registered with `registerIdempotentTool` and its input schema has no field for an idempotency or request key. FAIL if it is registered with `server.registerTool` directly, or its input takes such a key.
