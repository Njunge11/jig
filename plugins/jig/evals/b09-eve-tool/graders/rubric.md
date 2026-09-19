---
type: llm
weight: 2
---

PASS only if: the file is `agent/tools/get_job.ts` and its default export is `defineTool({...})`; `execute` is a named function declared at module scope and passed by name; the service is composed at module scope, not inside a factory function; a missing job and a forbidden caller are returned as values such as `{ status: "notFound" | "forbidden", message }`, not thrown; the body calls exactly one service method; the answer adds or names one eval `evals/tools/get_job.eval.ts`.

FAIL if the tool is built by a factory that declares `execute` inside a function body, or if expected failures throw.
