---
name: backend-entry-points
description: The entry rules for a durable workflow, an MCP tool, and an eve agent tool — determinism, steps, idempotency, error channels, annotations, composition, evals. Use when you write, set up, or review a durable or background workflow, an MCP tool or MCP server, or an eve agent tool — in an existing app or as the first one in a new repo (the structure skill places the files under workflows/, mcp/, and agent/tools/).
---

# Backend Entry Points

These are the rules for the backend's non-router entry points. The `backend-standards` skill owns the layered architecture, the service and repository rules, and the tRPC router entry. Each entry here is entry glue over the same layers: compose the real service, call exactly one service method, shape the result. The rules are stack conventions, never one repo's layout: in an existing app, follow them where the files already live; in a new repo, the **Wire this once** items are the setup list, and the `structure` skill places the files. The code examples use placeholder domains — substitute your own. The [Review checklist](#review-checklist) is a fast index, not a second explanation.

## Entry — Workflow (`workflows/<name>/`)

Use a workflow for multi-step work that must survive crashes and waits — LLM calls, external APIs, human approval.

- **`index.ts` — the workflow function**, marked `"use workflow"`. **Does:** it orchestrates the steps and branches on their results. The runtime sandboxes this function and replays it from the event log. Thus the function must be **deterministic**: no I/O, no clock, no randomness, no service calls.
  **Never:** business logic or side effects — put those in steps.
- **`steps.ts` — step functions**, marked `"use step"`. A step has the full Node runtime. The step is the place that calls the services. The step performs the router's role: it composes the real service and invokes it. Steps retry automatically — 3 attempts by default. Adjust the count per step with `fn.maxRetries = n`. Keep the steps in a file separate from the workflow function — this prevents bundler issues.
- **Orchestrator state comes only from the step returns and the triggering input** — branch on nothing else. Every side effect lives inside a step.
- **Each step checks if its work is already complete before it does the work.** A retried step executes again from the top, so error classification alone does not make a retry safe. A step that saves reads the saved value first and returns when it is there; a step that sends reads the sent marker first, and writes the marker after the send.
- **Classify errors inside steps** (`import { FatalError, RetryableError } from "workflow"`). Throw `FatalError` for failures with no recovery (a bad credential) — it stops the retries. Throw `RetryableError` with `retryAfter` (a duration string, ms, or a Date) for rate limits and custom backoff. An error that you do not classify consumes the default retries.
- **Pause** with `await sleep("30d")` — this suspends the workflow and consumes no resources. Or pause with `createWebhook()` — the workflow resumes on external input. This is the human-approval pattern.
- **Start** runs from the application code: call `start(workflow, [input])` from `"workflow/api"`. The result is `await run.returnValue`.

## Entry — MCP tool (`mcp/*.tool.ts`)

A tool is a router for an external agent (Claude/ChatGPT). The client owns the conversation and the loop. Each call is stateless.

- **Define each tool with `registerTool(name, config, handler)`**. Give it a Zod `inputSchema` — the SDK validates the input before the handler runs. Write the `description` for the model: state the preconditions, and state when *not* to call the tool. Agents obey the description, not separate policy docs. Add an `outputSchema` when the result is structured. If you declare an `outputSchema`, the result **must** conform — the spec makes that a MUST. So derive both from one schema; never maintain two schemas.
- **The handler is entry glue.** Compose the real service. Call **exactly one** service method. Shape the result. The same **Never** list as the router applies: no business logic, no transactions, no queries.
- **Return `structuredContent` plus a text fallback.** The spec requires that a structured-content tool also serializes the result into a `content` text block for older clients.
- **Set the annotations explicitly on every tool.** The default for `destructiveHint` is `true`, and the default for `readOnlyHint` is `false`. Thus a read tool without annotations declares itself destructive. For reads, set `{ readOnlyHint: true }`. For destructive operations (publish, delete), set `destructiveHint: true` — then the hosts ask the user first.
- **There are two error channels — do not mix them.** Expected domain failures (validation, not-found, quota) go **in the result** as `isError: true`, with a message the model can act on. Never throw them. Thrown errors become JSON-RPC protocol errors. Reserve thrown errors for calls that are truly broken (unknown tool, malformed input).
- **Auth is server-side.** Annotations and client confirmations are not security controls. Every handler enforces RBAC through the service layer, the same as any other entry point.
- **Mutating tools are idempotent through a server-derived key** — never through a key that the model supplies. An LLM makes a new key for each retry, which defeats deduplication, or reuses one key across different intents. The server derives the key from `Mcp-Session-Id` + tool name + SHA-256 of the canonicalized arguments. The caller — the model or the host's HTTP retry — never knows that the key exists. The semantics: reserve the key atomically when execution begins. Store the first result (success or failure) and replay it on repeats. A repeat while the original call still runs waits for the original's result and returns it. If execution never began, store nothing — then genuine retries run again. Entries expire after ~1h. A derived key cannot separate a retry from a deliberate identical repeat; the short TTL limits that risk. Read-only tools are exempt. Set `idempotentHint: true` on deduplicated tools. This layer deduplicates repeats **across** calls. The step check-before-write (see Entry — Workflow) covers re-execution **within** a call. Both are required.
- **Wire this once, not per feature.** Set up these items one time with the official SDK's primitives: the single MCP endpoint (Streamable HTTP: POST per message, `Mcp-Session-Id`, `MCP-Protocol-Version`, Origin validation), the framework adapter, the OAuth/bearer middleware, and the idempotency store (a wrapper that every mutating tool registers through). Tool handlers never touch the transport, the tokens, or the dedup logic.

## Entry — eve agent tool (`agent/tools/<tool_name>.ts`)

A tool is a router for the app's own eve agent. eve owns the conversation, the loop and the session; the file name is the tool name, and the file is the composition root.

- **One file per tool, and the file name is the tool name.** eve registers every file under `agent/tools/` and names the tool after the file. Write the file name in the case the agent's instructions and the client use (`get_job.ts` → `get_job`). Never wrap the tool in a factory: the file's default export is `defineTool({ ...CONFIG, execute })`, and nothing else exports it.
- **The file is the composition root.** Module scope constructs the real stores and the real service once — `const jobs = makeJobsService({ repo: makeJobsRepo(db) })` — and it is the only file on the tool's path that imports the db client. The service and the repo take their dependencies as arguments, as everywhere else.
- **Declare `execute` as a named function at module scope, and pass the name.** The eve compiler hoists `execute` out of its closure into a generated function. It copies only the `const` and `let` bindings of an enclosing function into that function, and it drops a nested function declaration. A tool whose `execute` is declared inside a function body compiles, and then throws `ReferenceError` on its first call. `eve build` never reports this. A module-scope function needs no copy, so it is the one shape that compiles and runs.

```ts
// WRONG — a factory declares execute inside a function body; the compiled
// tool throws "getJob is not defined" on its first call
export function makeGetJob(deps: { db: Db }) {
  const jobs = makeJobsService({ repo: makeJobsRepo(deps.db) });
  async function getJob(input: GetJobInput, ctx: ToolContext) { … }
  return defineTool({ ...GET_JOB_CONFIG, execute: getJob });
}
export default makeGetJob({ db });

// RIGHT — the file composes at module scope and passes a module-scope name
const authz = makeCompanyAuthz(createAuthz({ db }));
const jobs = makeJobsService({ repo: makeJobsRepo(db) });

async function getJob(input: GetJobInput, ctx: ToolContext) {
  const caller = await permittedCaller(ctx, authz, PERMISSIONS.JOBS_READ);
  if (!caller) return FORBIDDEN;
  return jobs.getJob(input.job_id, caller.companyId);
}

export default defineTool({ ...GET_JOB_CONFIG, execute: getJob });
```

- **The body is entry glue.** Read the caller through one shared helper in `agent/lib/` — it reads the session the channel door left on the context and asks the policy one coarse question — and return the tool's refusal when it answers nothing. Then call **exactly one** service method and shape the result. The same **Never** list as the router applies: no business logic, no transactions, no queries. The tool never reads headers or tokens; the channel's auth walk owns them.
- **Describe the tool for the model in a named constant.** `<TOOL_NAME>_CONFIG` holds the `description` and the Zod `inputSchema`; the file spreads it into `defineTool`. Write the description as the MCP rule says: preconditions, and when *not* to call the tool.
- **Expected failures are return values, never throws.** Answer `{ status: "notFound" | "forbidden" | "refused", message }` with a message the model can act on. A thrown error ends the turn for the user. Throw only for a call that is truly broken.
- **Prove the tool through the agent, with one eval per tool.** `evals/tools/<tool_name>.eval.ts` sends one message, and a scripted mock model (`mockModel` from `eve/evals`) turns that message into the one tool call. The eval asserts `t.succeeded()` and `t.calledTool(name, { status: "completed", output, count: 1 })`. The eval runs the compiled build, so it is the only test that catches a tool the compiler broke; a Vitest test of the same function imports the source and passes. The eval's caller is eve's local principal, which belongs to no workspace, so the asserted output is the tool's refusal. The tool's behaviours for a real caller are proven at the service layer.
- **Wire this once, not per tool.** Set up these items one time: the agent definition with the model switch that selects the scripted model (an environment variable the eval script sets), the channel with its auth walk (the app's session door, then eve's local-dev door so the eval server can call in), `evals/evals.config.ts`, and an `eval` script that the developer runs by hand, never an agent and never a check target. A tool file never touches the model, the channel, or the eval server.

## Review checklist

Reject the change if any item is true. Skip items 1–3 when the diff has no workflow, items 4–5 when it has no MCP tool, and items 6–7 when it has no eve tool. These items keep their old backend-standards numbers in the lint rule names.

1. A workflow function (`"use workflow"`) does I/O, calls a service, or reads the clock or randomness.
2. A workflow step performs a side effect and does not check that the effect is still needed, or the orchestrator branches on data other than the step returns and the input.
3. A step's failure modes are not classified (`FatalError` vs `RetryableError`) where they differ.
4. An MCP tool has no annotations, throws a domain error instead of a return with `isError: true`, or returns `structuredContent` without the text fallback.
5. A mutating MCP tool is registered outside the idempotency wrapper, or accepts an idempotency key as input.
6. An eve tool's `execute` is declared inside a function body or wrapped in a factory, instead of a named function at module scope in `agent/tools/<tool_name>.ts`; or the tool throws an expected failure instead of returning it. Gate for the `execute` clause: `pnpm lint`, rule `no-restricted-syntax (backend-standards 26)`; walk the rest by hand.
7. An eve tool has no eval in `evals/tools/<tool_name>.eval.ts` that runs it through the compiled agent, or the project's check target does not run the evals.
