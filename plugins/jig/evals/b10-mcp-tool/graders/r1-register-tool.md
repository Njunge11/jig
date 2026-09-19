---
type: llm
weight: 1
---

Judge only the one point below. Ignore every other quality of the answer. Do not fail the answer for a fault that this point does not name.

PASS if the tool is registered with a name, a config object and a handler — `registerTool(name, config, handler)` or the app's `register(name, config, handler)` wrapper around it — and the config has a Zod `inputSchema`. FAIL if the input has no Zod schema.
