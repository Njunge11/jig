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

**Load `references/workflow-entry.md` before you write or review a workflow.** It holds the rules for the `"use workflow"` function and the `"use step"` functions: determinism, the check-before-write on each step, the retry counts, the `FatalError`/`RetryableError` classification, the pause primitives, and the start call. It backs Review checklist items 5–7.

### Entry — MCP tool (`mcp/*.tool.ts`)

A tool is a router for an external agent (Claude/ChatGPT). The client owns the conversation and the loop. Each call is stateless.

**Load `references/mcp-entry.md` before you write or review an MCP tool.** It holds the `registerTool` contract, the `structuredContent` + text fallback, the annotation defaults, the two error channels, the server-derived idempotency key, and the wire-once transport setup. It backs Review checklist items 8–9.

### Entry — eve agent tool (`agent/tools/<tool_name>.ts`)

A tool is a router for the app's own eve agent. eve owns the conversation, the loop and the session; the file name is the tool name, and the file is the composition root.

**Load `references/eve-entry.md` before you write or review an eve tool.** It holds the one-file-per-tool rule, the module-scope `execute` the compiler requires, the shared caller helper, the return-value error channel, the one-eval-per-tool proof on the compiled build, and the wire-once agent, channel and eval setup. It backs Review checklist items 26–27.

### Service — `api/*.service.ts`

**Does:** all the business logic. It coordinates the repositories and the external services. It owns the transaction boundaries. It transforms the domain objects. It throws the domain errors.
**Never:** HTTP/tRPC concerns, status codes, SQL, or ORM queries. Never validate again the input that the entry point already validated.

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

**Never**
- No queries inside loops. No duplicate queries for the same data.
- No sequential `await`s for independent operations — use `Promise.all`.
- No unbounded list queries. No full table scans where an index should exist.

## Transactions

- Use a transaction when multiple writes must succeed together. Also use one when reads and writes must stay consistent (state transitions, money, anything multi-table).
- The **service** opens the transaction and passes the `tx` handle into the repository calls. Repositories never start one.
- Do not wrap independent read-only operations in a transaction.

## Error handling

Errors flow up: Repository → Service → Entry → the global handler (tRPC) or the retry machinery (workflow steps — see the Workflow entry for classification).

- Do not wrap every function in `try/catch`.
- Catch **only** for these purposes: to add context, to convert an infrastructure error into a domain error, or to recover from an expected failure.
- Never discard an error — let it propagate.

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

**Reuse.**

- Reuse existing code only if it already follows these standards. If it does not, refactor it — do not copy it.
- Extract shared logic when the repetition is real (a general guide: the third copy) — do not extract before that.
- Never duplicate business logic, queries, validation, or utilities.

## Review checklist

Reject the change if any item is true. Items 5–7 need `references/workflow-entry.md`; items 8–9 need `references/mcp-entry.md`; items 26–27 need `references/eve-entry.md` — load each file before you judge its items, and skip those items when the diff has no workflow, no MCP tool or no eve tool.

1. A file is outside the feature tree, or the schema is outside its correct home (`db/schema/`; in a monorepo: the workspace db package for shared tables, the prefixed app-local `db/schema/` for private ones).
2. A service or a repo is a class or a module singleton, or a layer below the entry point imports the db client.
3. An entry point (router, MCP tool, eve tool, or workflow) accesses the DB or contains business logic.
4. An auth check is written by hand inside a procedure body instead of in a composed base procedure.
5. A workflow function (`"use workflow"`) does I/O, calls a service, or reads the clock or randomness.
6. A workflow step performs a side effect and does not check that the effect is still needed, or the orchestrator branches on data other than the step returns and the input.
7. A step's failure modes are not classified (`FatalError` vs `RetryableError`) where they differ.
8. An MCP tool has no annotations, throws a domain error instead of a return with `isError: true`, or returns `structuredContent` without the text fallback.
9. A mutating MCP tool is registered outside the idempotency wrapper, or accepts an idempotency key as input.
10. A service contains HTTP/tRPC concerns or SQL/ORM queries.
11. A repository contains business logic or validation, or starts a transaction.
12. The code bypasses a layer boundary.
13. Atomicity is required, but no transaction wraps the writes.
14. N+1 queries, queries in a loop, or duplicate queries.
15. Independent `await`s run in sequence instead of through `Promise.all`.
16. `SELECT *`, or raw SQL where Drizzle has an equivalent.
17. A list endpoint has no pagination, or a hot column has no index.
18. A migration file was written by hand, or an applied migration was edited.
19. Repeated `try/catch`, or an error is discarded instead of propagated.
20. Duplicated business logic, query, or validation.
21. A type is declared by hand where Drizzle/tRPC inference exists, or a parallel `interface` duplicates an API payload.
22. A helper takes the rest of a method as a callback in order to share a prologue, instead of returning a value that the caller checks.
23. A function returns a function to bind a dependency that could be a parameter, or a factory wraps something that is not a service or a repository.
24. A factory writes a method body inside the object it returns, instead of returning a list of named functions.
25. A call takes a function of more than one line, or an object literal of more than a few lines, as an inline argument — instead of a named function or a named constant declared above the call.
26. An eve tool's `execute` is declared inside a function body or wrapped in a factory, instead of a named function at module scope in `agent/tools/<tool_name>.ts`; or the tool throws an expected failure instead of returning it.
27. An eve tool has no eval in `evals/tools/<tool_name>.eval.ts` that runs it through the compiled agent, or the project's check target does not run the evals.
