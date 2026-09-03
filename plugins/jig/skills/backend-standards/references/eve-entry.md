# Entry — eve agent tool (`agent/tools/<tool_name>.ts`)

The rules for the eve agent-tool entry point. Load this file when the feature has a tool that an eve agent calls. It backs items 26 and 27 of the Review checklist in `SKILL.md`.

A tool is a router for the app's own agent. eve owns the conversation, the loop, and the session; the tool sees one call at a time. The rules for the MCP tool apply to the tool's body; the rules below are the ones eve adds.

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
- **Wire this once, not per tool.** Set up these items one time: the agent definition with the model switch that selects the scripted model (an environment variable the eval script sets), the channel with its auth walk (the app's session door, then eve's local-dev door so the eval server can call in), `evals/evals.config.ts`, and an `eval` script that the project's check target runs. A tool file never touches the model, the channel, or the eval server.
