# CLAUDE.md

{{PROJECT}}: {{ONE_LINE}}. {{APPS_SENTENCE}} share one Postgres database (a
Supabase project) through internal packages. The specs are `docs/spec/`, the
technical decisions `docs/architecture.md`, the build plan
`docs/build/tracker.md` with its checklists.

This repo was set up by the jig `scaffold-repo` skill. A convention below is
changed in that skill first, then here: the skill is the source, this file is
one copy.

## Commands

Run from the repo root: `pnpm dev`, `pnpm build`, `pnpm lint`,
`pnpm typecheck`, `pnpm test`.

- Tests run on PGlite and need no database.
- `pnpm --filter {{SCOPE}}/db db:check` proves `DATABASE_URL` answers;
  `db:push` pushes the schema to it; `db:generate` and `db:migrate` write and
  apply migrations.
- `.env` at the repo root holds `DATABASE_URL` (the Supabase session-pooler
  URI, port 5432), `AUTH_SECRET` and `AUTH_URL`. Git ignores it;
  `.env.example` lists every key.

## Conventions and layout

The jig plugin skills are the standard. Invoke them with the Skill tool
before the work, and every change must pass their Review checklists:

- every file: `jig:structure` places it
- backend work: `jig:backend-standards`, `jig:backend-tests`
- frontend work: `jig:frontend-standards`, `jig:frontend-tests`
- a flow with stages that outlive one request is an XState machine built to
  `jig:state-machines`. Never derive a stage from data instead.
- a feature slice: `jig:implementation-planner` writes the checklist, the
  `/goal` session builds it with the `jig:implement-*` skills, and the
  read-only `jig:*-feature-reviewer` agents review it

## Always

- Work goes straight to `main`. There are no PRs. A builder works on a local
  branch in its worktree, commits locally after each task, and pushes once,
  when every Done item holds and the review fixes are committed:
  `git push origin HEAD:main`. When the push is refused because main moved,
  run `git pull --rebase origin main` and push again. The `ci` workflow on
  the pushed commit is the one check: lint, typecheck, build and the full
  suite.
- The commit hooks run lint-staged and commitlint. A subject starts in lower
  case and carries no attribution trailer.
- Migrations stay in order: a second task that adds a migration deletes its
  own and runs `pnpm --filter {{SCOPE}}/db db:generate` again on top of main,
  never edits `drizzle/meta/_journal.json` by hand.
- Never start a dev server to verify. Verify with `pnpm build` and the
  tests; the developer runs the app.
