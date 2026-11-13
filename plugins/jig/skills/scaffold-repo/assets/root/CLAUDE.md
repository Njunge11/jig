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
`pnpm typecheck`, `pnpm test`, `pnpm flows`, `pnpm screens`.

- `pnpm test` runs the backend tests on PGlite. They need no database.
- `pnpm flows` and `pnpm screens` run the end-to-end tests and the design
  check on the built app and the database of `.env` (see "Screens and
  flows").
- `pnpm --filter {{SCOPE}}/db db:check` proves `DATABASE_URL` answers;
  `db:push` pushes the schema to it with no prompt (`--force`: the one
  database is the dev database, and a builder runs it unattended);
  `db:seed` writes the seed account; `db:generate` and `db:migrate` write
  and apply migrations.
- `.env` at the repo root holds `DATABASE_URL` (the Supabase session-pooler
  URI, port 5432), `AUTH_SECRET` and `AUTH_URL`. Git ignores it;
  `.env.example` lists every key.

## Conventions and layout

The jig plugin skills are the standard. Invoke them with the Skill tool
before the work, and every change must pass their Review checklists:

- every file: `jig:structure` places it
- backend work: `jig:backend-standards`, `jig:backend-tests`
- frontend work: `jig:frontend-standards`, `jig:e2e-tests`. There are two
  test layers: backend tests on PGlite, and end-to-end tests on the built
  app. No test draws a component in jsdom.
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
- Each pushed commit has its own `ci` run. The workflow has no `concurrency`
  group, and no change adds one: builders push in parallel, and a group
  makes one builder's push cancel another builder's run. A builder touches
  only the run of its own commit: never `gh run rerun` or `gh run cancel` on
  the run of another commit. A run that shows `cancelled` is re-run once; a
  second `cancelled` goes to the developer, not to a third run.
- A `ci` job that reaches its time limit also shows as `cancelled`
  (`The job has exceeded the maximum execution time`). The fix is more
  shards in the workflow's `test` matrix, never a re-run and never a higher
  limit.
- The commit hooks run lint-staged and commitlint. A subject starts in lower
  case and carries no attribution trailer.
- Migrations stay in order: a second task that adds a migration deletes its
  own and runs `pnpm --filter {{SCOPE}}/db db:generate` again on top of main,
  never edits `drizzle/meta/_journal.json` by hand.
- Never start `next dev` or `next start`, and never use a dev port (3000
  and up): the developer runs the app there. Verify with `pnpm build`, the
  tests, `pnpm flows` and `pnpm screens`.

## Screens and flows

`packages/e2e` is the Playwright end-to-end suite, built to the jig
`e2e-tests` skill, which holds each rule. It builds one app, starts it
headless on its own port (3100 and up), signs in with the seed account and
stops the server at the end. No window opens. It refuses a server that
already answers on its port.

- `pnpm flows` runs each flow in `packages/e2e/flows/<app>/`;
  `pnpm flows <name>` runs one file; `APP=<app>` picks the app.
- `SCREENS="<Design>=<path>" pnpm screens` draws a route and its design,
  `docs/designs/<Design>.dc.html`, at the same window size, and fails on a
  difference of look. The design of a screen is its source file: the repo
  holds no picture of a design.
- Each run writes its report to `packages/e2e/.output/report/`. The report
  is the evidence of a run, never a task for the developer.
- The flows do not run in `ci`: it has no database. The pre-push hook runs
  them on this machine when the push holds app code, one run at a time, and
  refuses the push on a failure. Never push with `--no-verify` or `HUSKY=0`.
- Each test makes its own data and takes it away at its end. Data that it
  cannot take away carries one fixed marked name.
- Built screens that keep their look: none yet. When the developer changes
  a built screen after its design, name the screen here. No builder then
  changes its look to equal the design, and no flow uses `expectDesign` on
  it.
- A service that lists the origins it accepts (a bucket's CORS) also lists
  the e2e origins, `http://localhost:3100` and up.
