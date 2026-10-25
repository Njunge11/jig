---
type: llm
focus: {source: file, path: .eval/diff-app.txt}
weight: 1
---

Judge only the one question below. The input is the git diff of the change the agent made to the app code, without its tests. If the diff has no code that decides the question, the verdict is FAIL.

Question: is `delete_product` registered with a name, a config object and a handler (`registerTool(name, config, handler)` or the app's wrapper of the same shape), with a Zod schema as the config's `inputSchema`?

PASS if yes; a Zod object or a raw shape of Zod fields both count. FAIL if the tool has no `inputSchema`, or the input schema is not Zod.
