# Initializer Notes — How Backend Checklists Get Authored

Raw material for the future initializer skill. Distilled from hand-authoring the first real checklist (`ajiri-monorepo/docs/mcp-server/checklists/01-idempotency-store.md`, 2026-08-08) — including two authoring mistakes that got caught and reversed the same day.

## Where the context comes from

A checklist is a **translation, not a design**. It has three inputs:

1. **The spec, with semantics already decided.** Every behavior in the idempotency checklist traces to a decided sentence in `docs/mcp-server-design.md` §3 — server-derived key, atomic reserve, store-and-replay including failures, in-flight repeat waits, TTL ~1h, inline cleanup, no cron. Those decisions were made in design sessions *before* checklist time, each verified against sources. The checklist author invented zero semantics.
   - **Implication:** the initializer must refuse to fill spec gaps. If the spec hasn't decided a behavior, it surfaces the question to the developer — it never designs on the fly, because a checklist is immutable once the builder starts.
2. **The skills — authoritative for structure, naming, and harness.** `backend-standards` and `backend-tests` prescribe the feature tree, file suffixes, schema location, and test harness. The checklist repeats none of it and overrides none of it; it just names the feature slug and the app the feature lands in. The skills exist precisely because existing app code can't be trusted as a reference — they are the standard; code conforms to them.
3. **The repo, via a grounding pass — for repo-level facts only.** Workspace wiring (package filters, script names, turbo tasks, hook chain), what already exists vs what the scaffold must create, spec-adjacent constraints (where the shared database's migrations live). Rule: **never write a path or command into a checklist that wasn't verified against the repo.** (Session evidence: a first draft written from memory had four errors.)

## The two placement mistakes (2026-08-08) — don't repeat them

1. **Pilot was first placed inside `apps/dashboard`** (a legacy-convention app) because the harness already existed there. That manufactured a conflict between the skills' prescribed structure and the app's conventions.
2. **The conflict was then "resolved" by weakening the skills** — a precedence rule saying existing repo conventions win. That inverts the entire system: the skills degrade into a description of whatever code already exists, and enforce nothing.

Both reversed. The standing rule: **skill-governed features are built on the skills' ground.** New-standard work goes in a new app/package laid out per `backend-standards` — the first feature carries the minimal scaffold. Legacy apps are not a valid placement for skill-governed builds, and the skills are never edited to accommodate a placement mistake.

## Decomposition rules

- Split behaviors by layer per `backend-standards`, grouped under the source file they test: pure helpers → repository → service (→ entry when there is one). One test file per source file, per `backend-tests`.
- One behavior = one test = one red-green-refactor cycle = one commit.
- Behaviors are observable behavior with expected values from the spec — never implementation steps. ("`reserve` on an expired key treats it as absent", not "add a WHERE clause".)
- The first feature of a new app lists its **one-time scaffold** explicitly in Scope (package.json + scripts, tsconfig, vitest backend project, drizzle config, `db/schema/`); the scaffold is committed as an initial chore commit, then behaviors start.
- Schema + generated migration ride the **first repository behavior's** cycle.
- Respect the harness's testability limits when phrasing behaviors: PGlite is single-connection, so "concurrent" tests are `Promise.all` (serialized) — phrase the behavior around the atomic-insert outcome, not true parallelism. Expiry tests seed rows with past `expires_at` directly instead of demanding clock injection.
- ~15 behaviors was a comfortable reviewable unit for one feature/PR.

## Format (as executed)

Sections: `## Scope` → `## Skills` → `## Backend` → `## Manual verification` → `## Done`.

- The behavior list section is titled **`## Backend`** — that is the section `build-backend-feature` reads. (The workflow doc said "Behaviors"; resolved toward the executor. Reconcile the doc.)
- **Scope** carries: what this builds, spec pointer, target app + feature slug, the one-time scaffold list (first feature of an app only), and "Builds on:".
- **Skills** is documentation only — delivery is the builder agent's `skills:` frontmatter preload, never this section.
- **Manual verification**: commands the developer actually runs, verified against the scaffold the checklist itself defines.
- **Done**: transcript-visible artifacts only — checked items shown, green suite output, `git log` one-commit-per-behavior, handoff file exists, tracker row flipped, PR open with URL + What/Why/How/Verification body, plus invariants (no migration applied, no frontend files).

## For the initializer skill, when it's built

- It reads the skills for structure/harness and never contradicts them; the grounding pass covers repo-level wiring only.
- It asks the developer about undecided semantics instead of inventing them.
- It places skill-governed features on the skills' ground (new app/package per the prescribed layout), with the first feature carrying the scaffold.
- It authors the tracker + all checklists at once, ordered so each depends only on earlier features.
- Its Done sections must gate on artifacts a `/goal` evaluator can see in a transcript — never on unobservable claims.
