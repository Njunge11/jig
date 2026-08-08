---
name: backend-standards
description: Layered backend architecture — entry points (tRPC router, MCP tool, durable workflow) → service → repository → Drizzle. Use when writing or reviewing backend code — routers, MCP tools, workflows, services, repositories, queries, transactions, or migrations.
---

# Backend Standards

Rules for backend code. Each rule has one home; the [Review checklist](#review-checklist) is a fast index, not a re-explanation.

## Principles

- Follow the layered architecture; never bypass a layer.
- One responsibility per layer.
- Use framework / ORM (tRPC, Drizzle, Workflow SDK) primitives before writing custom code.
- Minimize database round trips.

## Structure

A feature is a folder; schema is central.

```
features/<feature>/
  checklist.md
  api/
    <feature>.router.ts        ← entry: tRPC
    <feature>.service.ts
    __tests__/
      <feature>.router.test.ts
      <feature>.service.test.ts
  db/
    <feature>.repo.ts
    __tests__/
      <feature>.repo.test.ts
  mcp/
    <feature>.tool.ts          ← entry: MCP tool (only if the feature has one)
  workflows/                   ← entry: durable workflow (only if the feature has one)
    <name>/
      index.ts                 ← workflow function
      steps.ts                 ← step functions
db/schema/
  <domain>.ts                  ← one file per domain (users.ts, jobs.ts, billing.ts)
```

- **Schema lives centrally in `db/schema/`**, one file per domain, `schema: "./db/schema"` in `drizzle.config.ts` (drizzle-kit reads the folder recursively; every table must be exported). Central because FKs cross domains constantly — feature-local schema files would import across features.
- **Monorepo schema placement**: tables consumed by more than one app live in the workspace db package (`packages/db` exporting schema + client — the create-t3-turbo pattern), which owns their drizzle config and migration history; an app's **private** tables stay in that app's `db/schema/` using Drizzle's multi-project safeguards — every table defined through a `pgTableCreator` name prefix (`<app>_`), `tablesFilter: ["<app>_*"]`, and its own migrations journal (`migrations: { schema: "drizzle_<app>" }`). Private tables never FK into another app's tables; the moment a second app needs a table, it moves to the db package.
- **Services and repositories are factory functions** — `make<X>Service(deps)`, `make<X>Repo(db)` — that receive every dependency as an argument: the repo, `now()`, `uuid()`, external clients. Never classes, never module-level singletons, and nothing imports the db client except the entry point. Required for the fake-repo / injected-clock testing in `backend-tests`.
- **The entry point is the composition root**: the router procedure or workflow step constructs the real repo and service and wires them together. Everything below it only receives dependencies.

## Layers

```
Entry:  tRPC Router  │  MCP tool  │  Workflow ("use workflow" + steps)
              └──────────┬──────────┘
                      Service
                         │
                     Repository
                         │
                 Drizzle / Postgres
```

Each layer talks only to the next. An entry point never reaches a repository or the DB directly.

### Entry — Router (`api/*.router.ts`)

The tRPC procedure. **Does:** validate input (`.input(zod)`), authenticate **and authorize** the caller, call **exactly one** service method, shape the response/error for the client.

- **Auth lives in composed base procedures, not procedure bodies** — the docs' named-procedure pattern: `publicProcedure` → `protectedProcedure` (middleware asserts a session and narrows the context type) → scoped procedures (`orgProcedure`, permission-gated procedures) that add one check each. A feature router picks the right base procedure; it never re-implements the check inline.
- **Entry-level authorization is coarse** — "does this principal hold this permission." Object-level checks ("may this user touch this row") belong to the service, which is where the row is loaded.

**Never:** business logic, transactions, SQL, ORM/Drizzle queries, auth checks hand-rolled inside a procedure body, calling other procedures through a server-side caller (compose at the service layer).

### Entry — Workflow (`workflows/<name>/`)

For multi-step work that must survive crashes and waits — LLM calls, external APIs, human approval.

- **`index.ts` — the workflow function**, marked `"use workflow"`. **Does:** orchestrate steps and branch on their results. It runs sandboxed and is replayed from the event log, so it must be **deterministic**: no I/O, no clock or randomness, no service calls.
  **Never:** business logic or side effects — those live in steps.
- **`steps.ts` — step functions**, marked `"use step"`. Full Node runtime; a step is where services get called (the step plays the router's role: compose the real service, invoke it). Steps auto-retry — 3 attempts by default, tune per step with `fn.maxRetries = n`. Keep steps in a separate file from the workflow function (prevents bundler issues).
- **Orchestrator state comes only from step returns and the triggering input** — branch on nothing else. Every side effect lives inside a step, and each step checks whether its work is already done before doing it: a retried step re-executes from the top, so error classification alone doesn't make retrying safe.
- **Classify errors inside steps** (`import { FatalError, RetryableError } from "workflow"`): `FatalError` for unrecoverable failures (bad credential — stops retries); `RetryableError` with `retryAfter` (duration string, ms, or Date) for rate limits and custom backoff. An unclassified throw consumes the default retries.
- **Pause** with `await sleep("30d")` (suspends without consuming resources) or `createWebhook()` (resumes on external input — the human-approval pattern).
- **Start** runs from application code: `start(workflow, [input])` from `"workflow/api"`; the result is `await run.returnValue`.

### Entry — MCP tool (`mcp/*.tool.ts`)

A tool is a router for an external agent (Claude/ChatGPT): the client owns the conversation and the loop; each call is stateless.

- **Define with `registerTool(name, config, handler)`** — Zod `inputSchema` (the SDK validates before the handler runs), a `description` written for the model that states preconditions and when *not* to call the tool (agents follow the description, not out-of-band policy docs), and `outputSchema` when the result is structured. If `outputSchema` is declared, the result **must** conform — the spec makes that a MUST, so derive both from one schema, never maintain two.
- **The handler is entry glue**: compose the real service, call **exactly one** service method, shape the result. Same **Never** list as the router: no business logic, no transactions, no queries.
- **Return `structuredContent` plus a text fallback** — the spec requires structured-content tools to also serialize into a `content` text block for older clients.
- **Set annotations explicitly on every tool**: `destructiveHint` defaults to `true` and `readOnlyHint` to `false`, so an un-annotated read tool advertises itself as destructive. Reads: `{ readOnlyHint: true }`. Destructive ops (publish, delete): `destructiveHint: true` so hosts ask the user first.
- **Two error channels, don't mix them**: expected/domain failures (validation, not-found, quota) go **in the result** as `isError: true` with a message the model can act on — never thrown. Thrown errors become JSON-RPC protocol errors, reserved for genuinely broken calls (unknown tool, malformed input).
- **Auth is server-side**: annotations and client confirmations are not security controls. Every handler enforces RBAC through the service layer like any other entry point.
- **Mutating tools are idempotent via a server-derived key** — never a key the model supplies (an LLM mints a fresh key per retry, which defeats deduplication, or reuses one across different intents). The key is `Mcp-Session-Id` + tool name + SHA-256 of the canonicalized arguments; the caller — model or the host's HTTP retry — never knows it exists. Semantics: reserve the key atomically when execution begins; store the first result (success or failure) and replay it on repeats; a repeat while the original is in-flight waits for and returns the original's result; nothing is stored if execution never began, so genuine retries re-run. Entries expire after ~1h — a derived key can't distinguish a retry from a deliberate identical repeat, and the short TTL bounds that risk. Read-only tools are exempt. Set `idempotentHint: true` on deduplicated tools. This layer dedupes repeats **across** calls; step check-before-write (Workflow entry) covers re-execution **within** a call — both are required.
- **One-time wiring, not per-feature**: the single MCP endpoint (Streamable HTTP: POST per message, `Mcp-Session-Id`, `MCP-Protocol-Version`, Origin validation), framework adapter, OAuth/bearer middleware, and the idempotency store (a wrapper every mutating tool registers through) are set up once with the official SDK's primitives — tool handlers never touch transport, tokens, or dedup logic.

### Service — `api/*.service.ts`

**Does:** all business logic; coordinate repositories and external services; own transaction boundaries; transform domain objects; throw domain errors.
**Never:** HTTP/tRPC concerns, status codes, SQL, ORM queries, re-validating input the entry point already validated.

### Repository — `db/*.repo.ts`

**Does:** read/write the DB; compose Drizzle queries; map rows to domain shapes. Accepts an injected `db`/`tx` handle.
**Never:** business logic, validation, HTTP concerns, external API calls, starting its own transaction.

## Queries & performance

Before writing a query, check whether it can be: one query instead of several, one transaction, a batch, concurrent calls, or work done by the DB instead of in JS.

**Always**
- Use Drizzle primitives; prefer them over raw SQL wherever Drizzle supports the operation.
- Select only the columns you need — **never `SELECT *`**.
- One query with `JOIN`/relations instead of N+1 (a query per row).
- Set-based writes: bulk insert; `UPDATE … WHERE` instead of read-modify-write; `DELETE … WHERE` instead of read-then-delete.
- Run independent operations concurrently:
  ```ts
  const [user, orders, notifications] = await Promise.all([
    getUser(), getOrders(), getNotifications(),
  ]);
  ```
- Paginate every list endpoint.
- Reuse hot queries as prepared statements — `.prepare()` with `sql.placeholder(...)` for dynamic values, so the driver reuses precompiled SQL.
- Index frequently-queried columns; enforce constraints in the schema.
- Keep queries deterministic (stable ordering for pagination).

**Never**
- Queries inside loops, or duplicate queries for the same data.
- Sequential `await`s for independent operations (use `Promise.all`).
- Unbounded list queries, or full table scans where an index should exist.

## Transactions

- Use one when multiple writes must succeed together, or reads and writes must stay consistent (state transitions, money, anything multi-table).
- The **service** opens the transaction and passes the `tx` handle into repository calls. Repositories never start one.
- Don't wrap independent read-only operations in a transaction.

## Error handling

Errors bubble up: Repository → Service → Entry → global handler (tRPC) or retry machinery (workflow steps — see the Workflow entry for classification).

- Don't wrap every function in `try/catch`.
- Catch **only** to: add context, convert an infrastructure error into a domain error, or recover from an expected failure.
- Never swallow an error — let it propagate.

## Migrations

- The schema is the single source of truth.
- Generate migrations with Drizzle tooling (`db:generate`). Custom SQL (DDL drizzle-kit can't express, data seeding) goes through `drizzle-kit generate --custom`, never a hand-created file.
- Never edit an applied migration — add a new one for every schema change.
- **Never apply migrations.** Generating the migration file is part of a schema change; running it (`db:migrate`, `db:push`, or any command that alters a real database) is the developer's job, done manually. Tests are unaffected — the PGlite harness pushes schema into an in-memory instance, not a database.

## Types & reuse

**Single source of truth.** Each piece of information has one authoritative home; derive everything else from it, never restate it. The homes: DB types → Drizzle schema · API contract → tRPC procedures · validation → Zod · business logic → one reusable function.

**Derive types, never re-declare them.**

- DB types from the Drizzle schema — `typeof users.$inferSelect` / `$inferInsert` (or `InferSelectModel`). Never hand-write a row type.
- API payload types from the router — `inferRouterOutputs<AppRouter>` / `inferRouterInputs`. Never declare a parallel `interface` for a request/response.

```ts
export type User = typeof users.$inferSelect;            // not: type User = { id: string; … }
type GetUser = inferRouterOutputs<AppRouter>["user"]["get"];
```

**Reuse.**

- Reuse existing code only if it already follows these standards; otherwise refactor it, don't copy it.
- Extract shared logic once it's genuinely repeated (rule of thumb: the third copy) — not preemptively.
- Never duplicate business logic, queries, validation, or utilities.

## Review checklist

Reject the change if any is true:

1. A file sits outside the feature tree, or schema outside its prescribed home (`db/schema/`; in a monorepo: the workspace db package for shared tables, prefixed app-local `db/schema/` for private ones).
2. A service or repo is a class or module singleton, or the db client is imported below the entry point.
3. An entry point (router, MCP tool, or workflow) touches the DB or contains business logic.
4. An auth check is hand-rolled inside a procedure body instead of a composed base procedure.
5. A workflow function (`"use workflow"`) does I/O, calls a service, or reads the clock/randomness.
6. A workflow step performs a side effect without checking it's still needed, or the orchestrator branches on anything besides step returns and input.
7. A step's failure modes aren't classified (`FatalError` vs `RetryableError`) where they differ.
8. An MCP tool misses annotations, throws a domain error instead of returning `isError: true`, or returns `structuredContent` without the text fallback.
9. A mutating MCP tool is registered outside the idempotency wrapper, or takes an idempotency key as input.
10. Service contains HTTP/tRPC concerns or SQL/ORM queries.
11. Repository contains business logic, validation, or starts a transaction.
12. A layer boundary is bypassed.
13. Atomicity is required but no transaction wraps the writes.
14. N+1 queries, queries in a loop, or duplicate queries.
15. Independent `await`s run sequentially instead of via `Promise.all`.
16. `SELECT *`, or raw SQL where Drizzle has an equivalent.
17. A list endpoint lacks pagination, or a hot column lacks an index.
18. A migration file was hand-written or an applied one edited.
19. Repeated `try/catch`, or an error is swallowed instead of propagated.
20. Duplicated business logic, query, or validation.
21. A type is hand-declared where Drizzle/tRPC inference exists, or a parallel `interface` duplicates an API payload.
