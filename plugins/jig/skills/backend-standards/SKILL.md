---
name: backend-standards
description: Layered backend architecture — entry points (tRPC router, MCP tool, eve agent tool, durable workflow) → service → repository → Drizzle. Use when you write or review backend code — routers, MCP tools, eve agent tools, workflows, services, repositories, queries, transactions, or migrations.
---

# Backend Standards

This file gives the rules for backend code. Each rule has one home. The [Review checklist](#review-checklist) is a fast index, not a second explanation.

## Principles

- Follow the layered architecture. Never bypass a layer.
- Give each layer one responsibility, and each file one concern (Structure, "One file, one concern").
- Use the framework and ORM primitives (tRPC, Drizzle, Workflow SDK) before you write custom code.
- Make as few database round trips as possible.

## Structure

The `structure` skill owns the feature tree and every
file-placement rule. If it is not already in your context, invoke
it before you place a file. Place every file by its tree, never
by imitating existing code. A feature is a folder. The schema is
central.

- **One file, one concern, at every layer.** A file hides one design decision, and a change to that decision touches only that file. That is Parnas's criterion for a module (1972), Dijkstra's separation of concerns (1974), functional cohesion (Stevens, Myers and Constantine, 1974) and Martin's single responsibility principle (2003): one rule with four names. The test is a sentence, never a size. Write what the file owns in one sentence with no "and", and put that sentence as the file's first doc comment. One sentence is one file. A sentence with "and" is two files. Forty lines can fail the test, and four hundred can pass it. Name the file for its concern. A service is one concern the feature decides, never one file per feature. A repo is one row set. A router is one resource (`structure` rule 9). A helper module is one computation. A task that adds a second concern to a file adds a file instead. A file that already holds several concerns is restructuring work, a step checklist, never a precedent.

```ts
// WRONG — one service per feature: four concerns, four reasons to change
// api/drafts.service.ts        startDraft, openForm, updateDraft, draftChanges

// RIGHT — one service per concern; each file's first line is its sentence
// api/start-draft.service.ts   "Creates a draft and puts it on its first stage."
// api/open-draft.service.ts    "Answers a request to open a draft's form or its overview."
// api/update-draft.service.ts  "Applies an edit stated in words to a draft."
// api/draft-changes.ts         "Lists the fields an update changed, for the receipt."
```

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

### Entry — Workflow, MCP tool, eve agent tool

The `backend-entry-points` skill owns these three entries — the workflow function and its steps, the MCP tool, and the eve agent tool — and their Review items. If it is not already in your context, invoke it before you write or review one of them. Each is entry glue over the same layers: compose the real service, call exactly one service method, and obey the router's **Never** list.

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
- **Never call an external service inside an open transaction** — email, an HTTP API, an LLM, a queue. The database can roll back; the call cannot. Commit first, then make the call. "All or none" with an external call never means one transaction around both.
- When the call must not be lost after the commit, write an outbox row in the same transaction as the business writes. A separate process — a workflow step — sends the row and marks it sent. The send can run twice, so the receiver or the step check makes it idempotent.

## Error handling

Errors flow up: Repository → Service → Entry → the global handler (tRPC) or the retry machinery (workflow steps — see the Workflow entry in `backend-entry-points` for classification).

- Do not wrap every function in `try/catch`.
- Catch **only** for these purposes: to add context, to convert an infrastructure error into a domain error, or to recover from an expected failure.
- Never discard an error — let it propagate.
- **Log every failure an entry hands to a client.** A `refused`, `notFound` or `forbidden` return and a thrown mutation error reach the server log with the procedure or tool name, the ids and the message. A failure the server does not log cannot be read when the user reports a dead screen.

## The call trace

Every request tells its story in one log block: each call it made, why it ran, what came back and how long it took, nested under the call that made it. The block is the first thing read when a screen dies or a turn is slow, so a call that is not in it did not happen, as far as the reader knows.

```
calling readRoleSuggestions to suggest the role's skills, tools and certifications. success. took 2.310 s
  calling permittedCaller to check the permission jobs:update. allowed. took 0.021 s
    query select user_companies. took 0.008 s
  calling hasCredits to check the credits. yes. took 0.009 s
    query select credit_grants. took 0.009 s
  calling repo.findDraft to read the draft. success. took 0.012 s
    query select job_drafts. took 0.012 s
  calling suggestRoleTerms to ask the model for the role's suggestions. success. took 2.250 s
```

- **One root per entry-point call, opened where the request enters.** A tRPC procedure opens it in the first middleware of its base procedure, so the session, permission and credit checks the later middlewares run are its first lines; the root line is `calling <procedure> to <purpose>`, with the purpose from the procedure's `.meta({ purpose })`. An eve tool opens it around its `execute` body, keyed by eve's call id, so the turn hook prints it with the model steps around it. An MCP tool and a workflow step open it around their one service call. A handler that calls the service bare prints nothing: `trace` records only under an open root.
- **Before you add an entry point, open the file that defines its base procedure and read its middlewares.** When none of them opens the root, this change adds that middleware, and the diff holds the base procedure's file. A change that names the root without showing it, or says the root "already exists" or "is assumed", has no root: the reviewer rejects it under item 35.
- **Every call a service makes is one `trace` line: `calling <name> to <purpose>`.** A repo method (`calling repo.findDraft to read the draft`), another service, a model (`calling suggestRoleTerms to ask the model for the role's suggestions`), a workflow start (`calling workflow screen to screen the application. started`), the machine move (`calling advance to move the draft from details_pending to role_pending`). The name is the real function's name. The purpose says what the call is for, in plain words.
- **A query traces itself.** The db client wraps every statement once, so no repo and no service traces a query by hand. Each shows as `query <verb> <table>` under the call that ran it.
- **The result is read off the call, never written into the line.** A `refused`, `notFound`, `forbidden` or `invalid` return prints `refused: "<message>"`; a throw prints `failed: <message>`; a check prints its own word through `describe` (`yes`, `allowed`, `decided: tool draft, action create`); anything else prints `success`.
- **A line holds no id and no message text.** The root says what the request does (`save the draft's details`), never what the user wrote.
- **The trace costs nothing when off.** `TRACE_LOG=1` turns it on. Off, every helper returns `fn()` and builds nothing. On, the tree is built in memory and printed with one write when the root closes. It adds no statement to any call.
- **The helper lives in the db package beside the client**, because the client is what traces the queries: `trace`, `traceQuery`, `traceLazyQuery`, `traceRoot`, `traceBlock`, `takeTrace`, `renderTrace`. An app that has none writes it once there, never per feature. Every entry point has a call-trace test (`backend-tests`, "The call trace test").

```ts
// WRONG — the handler calls the service bare; every trace line under it records nothing
suggestions: creditedProcedure.input(schema).query(({ ctx, input }) =>
  makeRoleSuggestionsService(deps(ctx)).readRoleSuggestions(input),
),

// RIGHT — the base procedure's first middleware opens the root; the checks and the service's calls are its lines
export const creditedProcedure = protectedProcedure
  .use(({ ctx, meta, path, next }) =>
    // next() answers { ok, error } and never throws, so the root reads its word off that
    traceBlock(`calling ${path} to ${meta?.purpose ?? "serve the request"}`, next, {
      log: ctx.log,
      describe: (result) => (result.ok ? "success" : `failed: ${result.error.message}`),
    }),
  )
  .use(requirePermission)
  .use(requireCredits);

suggestions: creditedProcedure
  .meta({ purpose: "suggest the role's skills, tools and certifications" })
  .input(schema)
  .query(({ ctx, input }) => makeRoleSuggestionsService(deps(ctx)).readRoleSuggestions(input)),

// api/role-suggestions.service.ts — each call the service makes is one line
const draft = await trace("calling repo.findDraft to read the draft", () =>
  deps.repo.findDraft(companyId, draftId),
);
const terms = await trace("calling suggestRoleTerms to ask the model for the role's suggestions", () =>
  suggestRoleTerms(role, { model: deps.model }),
);
```

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

Reject the change if any item is true. Items 5–9 and 26–27 live in the `backend-entry-points` Review checklist; walk it when the diff touches a workflow, an MCP tool, or an eve tool. The numbers below stay stable because the lint gate names use them.

1. A file is outside the feature tree, or the schema is outside its correct home (`db/schema/`; in a monorepo: the workspace db package for shared tables, the prefixed app-local `db/schema/` for private ones).
2. A service or a repo is a class or a module singleton, or a layer below the entry point imports the db client. Gate for the class clause and the db-client import: `pnpm lint`, rule `no-restricted-syntax (backend-standards 2)` and `no-restricted-imports (backend-standards 2)`; walk the rest by hand.
3. An entry point (router, MCP tool, eve tool, or workflow) accesses the DB or contains business logic. Gate for the query-import clause: `pnpm lint`, rule `no-restricted-imports (backend-standards 3)`; walk the rest by hand.
4. An auth check is written by hand inside a procedure body instead of in a composed base procedure.
5. Moved — `backend-entry-points` Review item 1 (workflow function purity).
6. Moved — `backend-entry-points` Review item 2 (step re-check and orchestrator state).
7. Moved — `backend-entry-points` Review item 3 (step error classification).
8. Moved — `backend-entry-points` Review item 4 (MCP annotations, error channel, text fallback).
9. Moved — `backend-entry-points` Review item 5 (MCP idempotency wrapper).
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
26. Moved — `backend-entry-points` Review item 6 (eve tool `execute` shape and failure returns).
27. Moved — `backend-entry-points` Review item 7 (eve tool eval through the compiled agent).
28. An entry hands a failure to a client that the server does not log with the procedure or tool name, the ids and the message.
29. An entry-point call has no statement-budget test, or the diff raises a call's statement count without the behavior that needs the extra statement named in the task.
30. A feature router holds the procedures of more than one resource, or holds input schemas or composition, instead of merging one `<resource>.router.ts` per resource as the `structure` skill lays out.
31. A non-test file forces a type with `as never` or a double assertion (`as any as T`, `as unknown as T`). Gate: `pnpm lint`, rule `no-restricted-syntax (backend-standards 31)`.
32. A service moves a stage or status with hand-written conditions on a field, instead of `transition` on the machine and its stored snapshot (`state-machines`).
33. An external call (email, HTTP API, LLM, queue) runs inside an open transaction, or a send that must not be lost has no outbox row written with the business writes.
34. A file holds more than one concern: what it owns cannot be stated in one sentence without "and", or a change to one decision it holds would touch code that another decision owns. Line count is never the test.
35. An entry-point call opens no trace root where the request enters, or the diff relies on a root middleware it does not show, or a call a service makes (a repo method, another service, a model, a workflow start, the machine move) runs outside `trace`, or a trace line names no purpose, holds an id or message text, or writes its result by hand instead of reading it off the call (The call trace).
