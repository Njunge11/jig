---
name: backend-standards
description: Layered backend architecture — entry points (tRPC router, MCP tool, eve agent tool, durable workflow) → service → repository → Drizzle. Use when you write or review backend code — routers, MCP tools, eve agent tools, workflows, services, repositories, queries, transactions, or migrations.
---

# Backend Standards

This file gives the rules for backend code. Each rule has one home. The [Review checklist](#review-checklist) is a fast index, not a second explanation.

## Principles

- Follow the layered architecture. Never bypass a layer.
- Give each layer one responsibility.
- Use the framework and ORM primitives (tRPC, Drizzle, Workflow SDK) before you write custom code.
- Make as few database round trips as possible.

## Structure

The `structure` skill owns the feature tree and every
file-placement rule. If it is not already in your context, invoke
it before you place a file. Place every file by its tree, never
by imitating existing code. A feature is a folder. The schema is
central.

- **The schema lives centrally in `db/schema/`**, with one file per domain. Set `schema: "./db/schema"` in `drizzle.config.ts`. The drizzle-kit tool reads the folder recursively. You must export every table. The schema is central because FKs cross domains constantly. Feature-local schema files would import across features.
- **Monorepo schema placement**: tables that more than one app uses live in the workspace db package. That package is `packages/db`, which exports the schema and the client. That package owns their drizzle config and their migration history. An app's **private** tables stay in that app's `db/schema/`, with Drizzle's multi-project safeguards. Define every private table through a `pgTableCreator` name prefix (`<app>_`). Set `tablesFilter: ["<app>_*"]`. Give the app its own migrations journal (`migrations: { schema: "drizzle_<app>" }`). Private tables never FK into another app's tables. When a second app needs a table, move that table to the db package.
- **Services and repositories are factory functions** — `make<X>Service(deps)`, `make<X>Repo(db)`. Each factory receives every dependency as an argument: the repo, `now()`, `uuid()`, and the external clients. Never write them as classes. Never write them as module-level singletons. Only the entry point imports the db client. The fake-repo and injected-clock tests in `backend-tests` require this pattern.
- **Only a service or a repository is a factory.** A factory is right for a unit that holds several methods and several dependencies, and that the entry point constructs once. Everything else is a plain function that takes its dependencies as parameters. Never return a function from a function to bind an argument.

```ts
// WRONG — a factory around one function, to bind one argument
export function makeValidator(reader: Reader) {
  return async function validate(form: Form, orgId: string) { … };
}
const validate = makeValidator(reader);
await validate(form, orgId);

// RIGHT — the dependency is a parameter
export async function validate(form: Form, orgId: string, reader: Reader) { … }
await validate(form, orgId, reader);
```

- **A factory returns a list of names.** Define each method as a named function in the body of the factory, then return `{ a, b, c }`. Never write a method body inside the returned object. The return statement is then the whole public surface, on one screen. A method whose body is a single expression — a repository query that passes straight through to Drizzle — may stay inline.

```ts
// WRONG — twelve method bodies inside one object literal
export const makeJobsService = (deps) => ({
  async publish(id) { …30 lines… },
  async close(id) { …20 lines… },
});

// RIGHT — named functions, then the surface
export function makeJobsService(deps) {
  async function publish(id) { …30 lines… }
  async function close(id) { …20 lines… }

  return { publish, close };
}
```

- **The entry point is the composition root**. The router procedure or the workflow step constructs the real repo and the real service and connects them. Each layer below the entry point only receives its dependencies.

The three files in that shape:

```ts
// db/invites.repo.ts — takes the handle, no db import
export const makeInvitesRepo = (db: Db | Tx) => ({
  create: (row: typeof invites.$inferInsert) =>
    db.insert(invites).values(row).returning({ id: invites.id }),
});

// api/invites.service.ts — every dependency is an argument
export function makeInvitesService(deps: {
  repo: ReturnType<typeof makeInvitesRepo>;
  now: () => Date;
  uuid: () => string;
}) {
  async function invite(email: string) {
    return deps.repo.create({ id: deps.uuid(), email, createdAt: deps.now() });
  }

  return { invite };
}

// api/invites.router.ts — the composition root
export const invitesRouter = createTRPCRouter({
  invite: orgProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(({ ctx, input }) =>
      makeInvitesService({
        repo: makeInvitesRepo(ctx.db),
        now: () => new Date(),
        uuid: crypto.randomUUID,
      }).invite(input.email),
    ),
});
```

## Layers

```
Entry:  tRPC Router  │  MCP tool  │  eve tool  │  Workflow ("use workflow" + steps)
              └───────────────┬────────────────┘
                      Service
                         │
                     Repository
                         │
                 Drizzle / Postgres
```

Each layer calls only the next layer. An entry point never accesses a repository or the DB directly.

### Entry — Router (`api/*.router.ts`)

This entry is the tRPC procedure. **Does:** validate the input (`.input(zod)`). Authenticate **and authorize** the caller. Call **exactly one** service method. Shape the response or the error for the client.

- **Auth lives in composed base procedures, not in procedure bodies.** Compose them: `publicProcedure` → `protectedProcedure` → scoped procedures. The `protectedProcedure` middleware asserts a session and narrows the context type. The scoped procedures (`orgProcedure`, permission-gated procedures) each add one check. A feature router selects the correct base procedure. It never re-implements the check inline.
- **Entry-level authorization is coarse** — "does this principal hold this permission?" Object-level checks ("may this user access this row?") belong to the service. The service is the layer that loads the row.

**Never:** business logic, transactions, SQL, or ORM/Drizzle queries. Never write an auth check by hand inside a procedure body. Never call other procedures through a server-side caller — compose at the service layer.

### Entry — Workflow (`workflows/<name>/`)

Use a workflow for multi-step work that must survive crashes and waits — LLM calls, external APIs, human approval.

- **`index.ts` — the workflow function**, marked `"use workflow"`. **Does:** it orchestrates the steps and branches on their results. The runtime sandboxes this function and replays it from the event log. Thus the function must be **deterministic**: no I/O, no clock, no randomness, no service calls.
  **Never:** business logic or side effects — put those in steps.
- **`steps.ts` — step functions**, marked `"use step"`. A step has the full Node runtime. The step is the place that calls the services. The step performs the router's role: it composes the real service and invokes it. Steps retry automatically — 3 attempts by default. Adjust the count per step with `fn.maxRetries = n`. Keep the steps in a file separate from the workflow function — this prevents bundler issues.
- **Orchestrator state comes only from the step returns and the triggering input** — branch on nothing else. Every side effect lives inside a step. Each step checks whether its work is already complete before it does the work. A retried step executes again from the top, so error classification alone does not make a retry safe.
- **Classify errors inside steps** (`import { FatalError, RetryableError } from "workflow"`). Throw `FatalError` for failures with no recovery (a bad credential) — it stops the retries. Throw `RetryableError` with `retryAfter` (a duration string, ms, or a Date) for rate limits and custom backoff. An error that you do not classify consumes the default retries.
- **Pause** with `await sleep("30d")` — this suspends the workflow and consumes no resources. Or pause with `createWebhook()` — the workflow resumes on external input. This is the human-approval pattern.
- **Start** runs from the application code: call `start(workflow, [input])` from `"workflow/api"`. The result is `await run.returnValue`.

### Entry — MCP tool (`mcp/*.tool.ts`)

A tool is a router for an external agent (Claude/ChatGPT). The client owns the conversation and the loop. Each call is stateless.

- **Define each tool with `registerTool(name, config, handler)`**. Give it a Zod `inputSchema` — the SDK validates the input before the handler runs. Write the `description` for the model: state the preconditions, and state when *not* to call the tool. Agents obey the description, not separate policy docs. Add an `outputSchema` when the result is structured. If you declare an `outputSchema`, the result **must** conform — the spec makes that a MUST. So derive both from one schema; never maintain two schemas.
- **The handler is entry glue.** Compose the real service. Call **exactly one** service method. Shape the result. The same **Never** list as the router applies: no business logic, no transactions, no queries.
- **Return `structuredContent` plus a text fallback.** The spec requires that a structured-content tool also serializes the result into a `content` text block for older clients.
- **Set the annotations explicitly on every tool.** The default for `destructiveHint` is `true`, and the default for `readOnlyHint` is `false`. Thus a read tool without annotations declares itself destructive. For reads, set `{ readOnlyHint: true }`. For destructive operations (publish, delete), set `destructiveHint: true` — then the hosts ask the user first.
- **There are two error channels — do not mix them.** Expected domain failures (validation, not-found, quota) go **in the result** as `isError: true`, with a message the model can act on. Never throw them. Thrown errors become JSON-RPC protocol errors. Reserve thrown errors for calls that are truly broken (unknown tool, malformed input).
- **Auth is server-side.** Annotations and client confirmations are not security controls. Every handler enforces RBAC through the service layer, the same as any other entry point.
- **Mutating tools are idempotent through a server-derived key** — never through a key that the model supplies. An LLM makes a new key for each retry, which defeats deduplication, or reuses one key across different intents. The server derives the key from `Mcp-Session-Id` + tool name + SHA-256 of the canonicalized arguments. The caller — the model or the host's HTTP retry — never knows that the key exists. The semantics: reserve the key atomically when execution begins. Store the first result (success or failure) and replay it on repeats. A repeat while the original call still runs waits for the original's result and returns it. If execution never began, store nothing — then genuine retries run again. Entries expire after ~1h. A derived key cannot separate a retry from a deliberate identical repeat; the short TTL limits that risk. Read-only tools are exempt. Set `idempotentHint: true` on deduplicated tools. This layer deduplicates repeats **across** calls. The step check-before-write (see Entry — Workflow) covers re-execution **within** a call. Both are required.
- **Wire this once, not per feature.** Set up these items one time with the official SDK's primitives: the single MCP endpoint (Streamable HTTP: POST per message, `Mcp-Session-Id`, `MCP-Protocol-Version`, Origin validation), the framework adapter, the OAuth/bearer middleware, and the idempotency store (a wrapper that every mutating tool registers through). Tool handlers never touch the transport, the tokens, or the dedup logic.

### Entry — eve agent tool (`agent/tools/<tool_name>.ts`)

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
- **Wire this once, not per tool.** Set up these items one time: the agent definition with the model switch that selects the scripted model (an environment variable the eval script sets), the channel with its auth walk (the app's session door, then eve's local-dev door so the eval server can call in), `evals/evals.config.ts`, and an `eval` script that the project's check target runs. A tool file never touches the model, the channel, or the eval server.

### Service — `api/*.service.ts`

**Does:** all the business logic. It coordinates the repositories and the external services. It owns the transaction boundaries. It transforms the domain objects. It throws the domain errors.
**Never:** HTTP/tRPC concerns, status codes, SQL, or ORM queries. Never validate again the input that the entry point already validated.

- **A stage the service moves is an XState machine.** The service restores the stored snapshot, calls `transition(machine, state, event)`, stores the next snapshot through the repo, and runs the returned actions. Never an `if` chain on a status field. The `state-machines` skill owns the machine and this call.

### Repository — `db/*.repo.ts`

**Does:** it reads and writes the DB. It composes the Drizzle queries. It maps the rows to domain shapes. It accepts an injected `db`/`tx` handle.
**Never:** business logic, validation, HTTP concerns, or external API calls. A repository never starts its own transaction.

## Queries & performance

Before you write a query, check these options: one query instead of several, one transaction, a batch, concurrent calls, or work that the DB does instead of JS.

**Always**
- Use the Drizzle primitives. Prefer them over raw SQL wherever Drizzle supports the operation.
- Select only the columns that you need — **never `SELECT *`**.
- Write one query with `JOIN`/relations instead of N+1 queries (one query per row).
- Write set-based writes: use a bulk insert. Use `UPDATE … WHERE` instead of read-modify-write. Use `DELETE … WHERE` instead of read-then-delete.
- Run independent operations concurrently:
  ```ts
  const [user, orders, notifications] = await Promise.all([
    getUser(), getOrders(), getNotifications(),
  ]);
  ```
- Paginate every list endpoint.
- Reuse hot queries as prepared statements. Call `.prepare()` with `sql.placeholder(...)` for the dynamic values — then the driver reuses precompiled SQL.
- Index the columns that queries use frequently. Enforce the constraints in the schema.
- Keep the queries deterministic (a stable order for pagination).
- Give every entry-point call a statement budget. Before you write a procedure, tool or step, list the statements the behavior needs — one per row set it reads or writes — and write the count into the task. A test on the real database asserts that exact count (`backend-tests`, "Statement budget"). A budget that rises names, in the task, the behavior that needs the extra statement.

**Never**
- No queries inside loops. No duplicate queries for the same data.
- No sequential `await`s for independent operations — use `Promise.all`.
- No unbounded list queries. No full table scans where an index should exist.
- No statement the behavior does not need: a read whose rows another statement in the same call already returned, a re-read after a write that `.returning()` answers, a count beside the list it counts, a gate query the caller already ran. On a remote database each one is a round trip the user waits for.

## Transactions

- Use a transaction when multiple writes must succeed together. Also use one when reads and writes must stay consistent (state transitions, money, anything multi-table).
- The **service** opens the transaction and passes the `tx` handle into the repository calls. Repositories never start one.
- Do not wrap independent read-only operations in a transaction.

## Error handling

Errors flow up: Repository → Service → Entry → the global handler (tRPC) or the retry machinery (workflow steps — see the Workflow entry for classification).

- Do not wrap every function in `try/catch`.
- Catch **only** for these purposes: to add context, to convert an infrastructure error into a domain error, or to recover from an expected failure.
- Never discard an error — let it propagate.
- **Log every failure an entry hands to a client.** A `refused`, `notFound` or `forbidden` return and a thrown mutation error reach the server log with the procedure or tool name, the ids and the message. A failure the server does not log cannot be read when the user reports a dead screen.

## Control flow

Write each method as a flat sequence: do one step, check its result, return early on failure. The reader follows the method from the top to the bottom.

- Share a prologue by extracting a function that **returns a value the caller checks**. Never write one that takes the rest of the method as a callback. A callback moves the body of the method into an argument, and hides the order of the work.
- Two repeated lines in two methods cost less than a wrapper that hides both.

The difference is the shape of the shared helper, not the shape of the caller.

```ts
// WRONG — the helper takes the rest of the method
async function withOwnedJob(id, companyId, run) {
  const job = await repo.getById(id);
  if (job?.companyId !== companyId) return notFound("Job");
  return run(job);                       // ← the caller's body arrives here
}

async function closeJob(id: string, companyId: string) {
  return withOwnedJob(id, companyId, async (job) =>
    isValidTransition(job.status, "closed")
      ? written(await repo.setStatus(id, "closed"))
      : failed(cannotTransition(job.status, "closed")),
  );                                     // ← closeJob has no body of its own
}

// RIGHT — the helper returns the job, and the caller checks it
async function loadOwnedJob(id, companyId) {
  const job = await repo.getById(id);
  return job?.companyId === companyId
    ? { success: true as const, data: job }
    : { success: false as const, error: notFound("Job") };
}

async function closeJob(id: string, companyId: string) {
  const owned = await loadOwnedJob(id, companyId);
  if (!owned.success) return owned;      // ← one step, one check

  const current = owned.data.status;
  if (!isValidTransition(current, "closed")) {
    return failed(cannotTransition(current, "closed"));
  }
  return written(await repo.setStatus(id, "closed"));
}
```

Both versions share the same ownership check. Only the second one lets you read `closeJob` from the top to the bottom.

**Pass a name, never a body.** An argument of a call is a variable, a named constant, or a named function. When an argument is a function of more than one line, or an object literal of more than a few lines, declare it above the call with a name — then the call reads as one line, and each part reads on its own. A one-line arrow that forwards to a method (`(id) => repo.getJob(id)`) stays inline.

```ts
// WRONG — one call swallows the config and the handler; the reader scrolls
// through sixty lines to find out that this is one registration
register(
  "delete_job",
  {
    title: "Take one job off the board",
    description: "Delete one job this workspace has posted. …",
    inputSchema: deleteJobInput,
    outputSchema: deleteJobResult,
    annotations: { readOnlyHint: false, destructiveHint: true },
  },
  async (args, scope) => {
    const outcome = await deps.jobs.deleteJob(args.job_id, scope.companyId);
    if (outcome.status !== "deleted") {
      return { isError: true, content: [{ type: "text", text: outcome.message }] };
    }
    return toolResult({ deleted: true }, DELETED_MESSAGE);
  },
);

// RIGHT — the call passes names
const DELETE_JOB_CONFIG = {
  title: "Take one job off the board",
  description: "Delete one job this workspace has posted. …",
  inputSchema: deleteJobInput,
  outputSchema: deleteJobResult,
  annotations: { readOnlyHint: false, destructiveHint: true },
};

export function registerDeleteJob(register: RegisterTool, deps: DeleteJobDeps) {
  async function deleteJob(args: DeleteJobArgs, scope: CompanyScope) {
    const outcome = await deps.jobs.deleteJob(args.job_id, scope.companyId);
    if (outcome.status !== "deleted") {
      return { isError: true, content: [{ type: "text", text: outcome.message }] };
    }
    return toolResult({ deleted: true }, DELETED_MESSAGE);
  }

  register("delete_job", DELETE_JOB_CONFIG, deleteJob);
}
```

## Migrations

- The schema is the single source of truth.
- Generate the migrations with the Drizzle tooling (`db:generate`). Custom SQL (DDL that drizzle-kit cannot express, data seeding) goes through `drizzle-kit generate --custom` — never through a file created by hand.
- Never edit an applied migration. Add a new migration for every schema change.
- **Never apply migrations.** To generate the migration file is part of a schema change. To run it (`db:migrate`, `db:push`, or any command that alters a real database) is the developer's job — the developer does this manually. Tests are not affected: the PGlite test setup pushes the schema into an in-memory instance, not into a database.

## Types & reuse

**Single source of truth.** Each piece of information has one authoritative home. Derive everything else from that home. Never restate it. The homes: DB types → Drizzle schema · API contract → tRPC procedures · validation → Zod · business logic → one reusable function.

**Derive types. Never re-declare them.**

- Derive DB types from the Drizzle schema — `typeof users.$inferSelect` / `$inferInsert` (or `InferSelectModel`). Never write a row type by hand.
- Derive API payload types from the router — `inferRouterOutputs<AppRouter>` / `inferRouterInputs`. Never declare a parallel `interface` for a request or a response.

```ts
export type User = typeof users.$inferSelect;            // not: type User = { id: string; … }
type GetUser = inferRouterOutputs<AppRouter>["user"]["get"];
```

**Never force a type.** No `as never`, and no double assertion (`as any as T`, `as unknown as T`). TypeScript allows an assertion only "to a *more specific* or *less specific* version of a type"; each of these forms defeats that rule and hides a type that does not fit. Type the value at its source instead: a `$type<>()` on the column, a typed fake, a schema parse, or a narrowed union. Gate: `pnpm lint`, rule `no-restricted-syntax (backend-standards 31)`.

**Reuse.**

- Reuse existing code only if it already follows these standards. If it does not, refactor it — do not copy it.
- Extract shared logic when the repetition is real (a general guide: the third copy) — do not extract before that.
- Never duplicate business logic, queries, validation, or utilities.

## Gates

Run before a commit. Paste the output in the proof.

1. `pnpm lint` exits `0` in the app root. It proves every Review item that ends with `Gate:`; walk the other items by hand.

## Review checklist

Reject the change if any item is true. Skip items 5–7 when the diff has no workflow, items 8–9 when it has no MCP tool, and items 26–27 when it has no eve tool.

1. A file is outside the feature tree, or the schema is outside its correct home (`db/schema/`; in a monorepo: the workspace db package for shared tables, the prefixed app-local `db/schema/` for private ones).
2. A service or a repo is a class or a module singleton, or a layer below the entry point imports the db client. Gate for the class clause and the db-client import: `pnpm lint`, rule `no-restricted-syntax (backend-standards 2)` and `no-restricted-imports (backend-standards 2)`; walk the rest by hand.
3. An entry point (router, MCP tool, eve tool, or workflow) accesses the DB or contains business logic. Gate for the query-import clause: `pnpm lint`, rule `no-restricted-imports (backend-standards 3)`; walk the rest by hand.
4. An auth check is written by hand inside a procedure body instead of in a composed base procedure.
5. A workflow function (`"use workflow"`) does I/O, calls a service, or reads the clock or randomness.
6. A workflow step performs a side effect and does not check that the effect is still needed, or the orchestrator branches on data other than the step returns and the input.
7. A step's failure modes are not classified (`FatalError` vs `RetryableError`) where they differ.
8. An MCP tool has no annotations, throws a domain error instead of a return with `isError: true`, or returns `structuredContent` without the text fallback.
9. A mutating MCP tool is registered outside the idempotency wrapper, or accepts an idempotency key as input.
10. A service contains HTTP/tRPC concerns or SQL/ORM queries. Gate: `pnpm lint`, rule `no-restricted-imports (backend-standards 10)`.
11. A repository contains business logic or validation, or starts a transaction. Gate for the transaction clause: `pnpm lint`, rule `no-restricted-syntax (backend-standards 11)`; walk the rest by hand.
12. The code bypasses a layer boundary. Gate: `pnpm lint`, the rules of items 2, 3 and 10.
13. Atomicity is required, but no transaction wraps the writes.
14. N+1 queries, queries in a loop, or duplicate queries. Gate for the loop clause: `pnpm lint`, rule `no-await-in-loop`; walk the rest by hand.
15. Independent `await`s run in sequence instead of through `Promise.all`.
16. `SELECT *`, or raw SQL where Drizzle has an equivalent. Gate for the `SELECT *` clause: `pnpm lint`, rule `no-restricted-syntax (backend-standards 16)`; walk the rest by hand.
17. A list endpoint has no pagination, or a hot column has no index.
18. A migration file was written by hand, or an applied migration was edited.
19. Repeated `try/catch`, or an error is discarded instead of propagated. Gate for the empty-catch case: `pnpm lint`, rule `no-empty`; walk the rest by hand.
20. Duplicated business logic, query, or validation.
21. A type is declared by hand where Drizzle/tRPC inference exists, or a parallel `interface` duplicates an API payload.
22. A helper takes the rest of a method as a callback in order to share a prologue, instead of returning a value that the caller checks.
23. A function returns a function to bind a dependency that could be a parameter, or a factory wraps something that is not a service or a repository. Gate: `pnpm lint`, rule `no-restricted-syntax (backend-standards 23)`.
24. A factory writes a method body inside the object it returns, instead of returning a list of named functions. Gate: `pnpm lint`, rule `no-restricted-syntax (backend-standards 24)`.
25. A call takes a function of more than one line, or an object literal of more than a few lines, as an inline argument — instead of a named function or a named constant declared above the call. Gate for the inline-function clause: `pnpm lint`, rule `no-restricted-syntax (backend-standards 25)`; walk the rest by hand.
26. An eve tool's `execute` is declared inside a function body or wrapped in a factory, instead of a named function at module scope in `agent/tools/<tool_name>.ts`; or the tool throws an expected failure instead of returning it. Gate for the `execute` clause: `pnpm lint`, rule `no-restricted-syntax (backend-standards 26)`; walk the rest by hand.
27. An eve tool has no eval in `evals/tools/<tool_name>.eval.ts` that runs it through the compiled agent, or the project's check target does not run the evals.
28. An entry hands a failure to a client that the server does not log with the procedure or tool name, the ids and the message.
29. An entry-point call has no statement-budget test, or the diff raises a call's statement count without the behavior that needs the extra statement named in the task.
30. A feature router holds the procedures of more than one resource, or holds input schemas or composition, instead of merging one `<resource>.router.ts` per resource as the `structure` skill lays out.
31. A non-test file forces a type with `as never` or a double assertion (`as any as T`, `as unknown as T`). Gate: `pnpm lint`, rule `no-restricted-syntax (backend-standards 31)`.
32. A service moves a stage or status with hand-written conditions on a field, instead of `transition` on the machine and its stored snapshot (`state-machines`).
