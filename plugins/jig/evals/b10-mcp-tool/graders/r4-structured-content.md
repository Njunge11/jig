---
type: llm
weight: 1
---

Judge only the one point below. Ignore every other quality of the answer. Do not fail the answer for a fault that this point does not name.

PASS if a success returns structured content plus a text block: `structuredContent` with `content: [{ type: "text", ... }]`, or one helper call that builds both, such as `toolResult(data, message)`. FAIL if a success returns only text or only structured data.
