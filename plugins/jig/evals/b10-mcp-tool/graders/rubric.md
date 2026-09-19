---
type: llm
weight: 2
---

PASS only if: the tool is defined with `registerTool(name, config, handler)` and a Zod `inputSchema`; the annotations are set explicitly with `destructiveHint: true` (and not read-only); the two domain failures are returned in the result with `isError: true` and a message the model can act on, never thrown; a success returns `structuredContent` plus a text `content` block; the handler calls exactly one service method; the description states the preconditions or when not to call the tool.

FAIL if domain failures throw, if annotations are absent, or if the handler runs queries.
