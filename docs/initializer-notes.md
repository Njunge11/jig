# Initializer Notes — How Backend Checklists Get Authored

Raw material for the future initializer skill. Distilled from hand-authoring the first real checklist (`ajiri-monorepo/docs/mcp-server/checklists/01-idempotency-store.md`, 2026-08-08) — what the process actually was, including the mistakes.

## Where the context comes from

A checklist is a **translation, not a design**. It has exactly two inputs:

1. **The spec, with semantics already decided.** Every behavior in the idempotency checklist traces to a decided sentence in `docs/mcp-server-design.md` §3 — server-derived key, atomic reserve, store-and-replay including failures, in-flight repeat waits, TTL ~1h, inline cleanup, no cron. Those decisions were made in design sessions *before* checklist time, each verified against sources (Stripe semantics, IETF draft, etc.). The checklist author invented zero semantics; it converted decided sentences into test-level behaviors.
   - **Implication:** the initializer must refuse to fill spec gaps. If the spec hasn't decided a behavior (what happens on timeout? is failure stored?), the initializer surfaces the question to the developer — it never designs on the fly, because a checklist is immutable once the builder starts.
2. **The codebase, via a grounding pass.** Every path, command, file name, and harness reference in the checklist was verified against the repo before writing. The first draft was written from memory of the repo's conventions and had **four errors** (wrong test-file suffix, missing pure-helper file split, unnamed harness, unverified migration path). Grounding is mandatory, not optional polish.

## The grounding pass (concrete checks)

1. **Find the newest analogous module** and copy its conventions — not the oldest. `lib/members/` (newest) uses `<source>.repository.test.ts` / `<source>.service.test.ts`; the older `lib/jd-intake/` uses `.db.test.ts`. Recent wins: it reflects where conventions settled.
2. **Read the test harness entry points**, don't infer them: `test/tx-harness.ts` (`withTestDb()`), `test/global-setup.ts` (verified it applies the full `./drizzle` migration set — so repo tests exercise the generated migration; that claim went in the checklist only after reading the line).
3. **Verify every command**: migration dir from `drizzle.config.ts` (`out: "./drizzle"`), `db:generate` from `package.json`, the suite command (`test:run`), the scoped test command.
4. **Read `schema.ts` conventions** before prescribing columns: explicit snake_case column names, `pgEnum` for statuses, `timestamp(..., { withTimezone: true, mode: "date" })`.
5. **Steal file-layout patterns**: pure helpers get their own file + test (`invite-token.ts`), fakes live next to the real repository (`invitations.repository.fake.ts`), tests in `__tests__/`.

Rule: **never write a path, command, or convention into a checklist that wasn't read from the repo in this pass.** (Session evidence: everything pattern-matched from memory was wrong or lucky.)

## Decomposition rules

- Split behaviors by layer per backend-standards, grouped under the source file they test: pure helpers → repository → service (→ router when there is one). One test file per source file.
- One behavior = one test = one red-green-refactor cycle = one commit.
- Behaviors are observable behavior with expected values from the spec — never implementation steps. ("`reserve` on an expired key treats it as absent", not "add a WHERE clause".)
- The schema + generated migration ride the **first repository behavior's** cycle — schema has no test of its own; the harness (migration-built template) exercises it.
- Respect the harness's testability limits when phrasing behaviors: PGlite is single-connection, so "concurrent" tests are `Promise.all` (serialized) — phrase the behavior around the atomic-insert outcome, not true parallelism. Expiry tests seed rows with past `expires_at` directly instead of demanding clock injection.
- ~15 behaviors was a comfortable reviewable unit for one feature/PR.

## Format (as executed, authoritative over older prose)

Sections: `## Scope` → `## Skills` → `## Backend` → `## Manual verification` → `## Done`.

- The behavior list section is titled **`## Backend`** — that is the section `build-backend-feature` reads. (The workflow doc said "Behaviors"; resolved toward the executor. Reconcile the doc.)
- **Scope** carries: what this builds, spec pointer, **placement with real paths** (including a relocation note when the target app doesn't exist yet — the pilot built MCP code in `apps/dashboard` because that's where the harness and schema source of truth live), and "Builds on:".
- **Skills** is documentation only — delivery is the builder agent's `skills:` frontmatter preload, never this section.
- **Manual verification**: commands the developer actually runs, verified to exist.
- **Done**: transcript-visible artifacts only — checked items shown, full-suite green output, `git log` one-commit-per-behavior, handoff file exists, tracker row flipped, PR open with URL + What/Why/How/Verification body, plus invariants (no migration applied, no frontend files).

## For the initializer skill, when it's built

- It runs the grounding pass itself (newest analogous module, harness files, configs) before authoring anything.
- It asks the developer about undecided semantics instead of inventing them.
- It authors the tracker + all checklists at once, ordered so each depends only on earlier features.
- Its Done sections must gate on artifacts a `/goal` evaluator can see in a transcript — never on unobservable claims.
