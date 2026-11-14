---
name: scaffold-repo
description: Sets up a new repo for the jig pipeline in one run, so the first checklist builds on a working baseline. It writes the Turborepo workspace, the Next.js apps and the db, trpc and ui packages, the Playwright e2e package with a first flow, the husky hooks with commitlint, lint-staged and the pre-push e2e run, the ESLint gates, the CI workflow, CLAUDE.md with the straight-to-main rule, .env.example, then proves the database answers and the first flow passes, pushes main to GitHub and watches the first CI run go green. Use when the developer runs /jig:scaffold-repo, asks to scaffold, bootstrap, set up or create a new repo, project or monorepo for the jig stack, or asks to bring an existing repo's setup (hooks, CI, CLAUDE.md, gates) up to the jig standard.
argument-hint: "[repo name] [--apps admin,supplier] [--scope @cra] [--dir path]"
---

# Scaffold repo

Set up one repo so that every later skill finds what it expects: the hooks, the CI check, the `CLAUDE.md` rules, the lint gates, the two test layers (backend tests and end-to-end tests), a reachable database and a green first run on GitHub. Nothing in this skill is a template to adapt by hand: the files under `assets/` are the standard, and a repo that differs from them is the one that changes.

**This skill is the source of the repo conventions.** When a convention changes (the CI steps, a hook, a `CLAUDE.md` rule, a gate), change the asset here in the same commit as the first repo that gets it. A convention changed in one repo and not here is lost on the next repo.

## Instructions

### Step 1: Collect the decisions

Read `$ARGUMENTS`. The decisions are:

| Decision | Default | Source |
| --- | --- | --- |
| Repo name (`{{REPO}}`) | the folder name | argument or ask |
| Package scope (`{{SCOPE}}`) | `@` + the repo's initials (`cars-request-africa` → `@cra`) | `--scope` or default |
| Apps (`{{APPS}}`) | one app, `web` | `--apps` or ask |
| Ports | 3000, 3001, 3002 … in app order; the e2e run of each app uses 3100, 3101, 3102 … | fixed |
| Database | one Supabase project, session pooler | fixed |
| Git flow | straight to main, no PRs | fixed |
| Node | 24 | fixed |
| GitHub | private repo under the developer's account | fixed |

Ask only for a decision with no argument and no default, in one `AskUserQuestion` call. Never ask about a fixed row. The shape is always the Turborepo workspace (`apps/*`, `packages/*`), also for one app: one shape keeps every later skill's paths true.

**Gate:** every row of the table has a value, written in your output.

### Step 2: Write the repo root

Create the folder when it does not exist, and `git init -b main` when it is not a repo. Copy every file of `assets/root/` to the root: `gitignore` and `prettierignore` become `.gitignore` and `.prettierignore`, `nvmrc` becomes `.nvmrc`, `env.example` becomes `.env.example`. Replace `{{REPO}}`, `{{SCOPE}}`, `{{PROJECT}}`, `{{ONE_LINE}}` and `{{APPS_SENTENCE}}` in `package.json` and `CLAUDE.md` (`{{APPS_SENTENCE}}` is the apps named with their ports: "Two Next.js apps, admin (3000) and supplier (3001),"). Copy `assets/husky/*` to `.husky/`, with `{{APP_NAMES}}` in `pre-push` replaced by the app names with a space between them (`admin supplier`), and `assets/github/ci.yml` to `.github/workflows/ci.yml`. Then:

```bash
pnpm install          # runs `prepare`, which installs the husky hooks
git add -A && git commit -m "chore: scaffold the repo root"
```

**Gate:** the commit passes the hooks (commitlint and lint-staged ran, the subject is lower case). `cat .husky/pre-commit` shows `pnpm lint-staged`, and `.husky/pre-push` holds no `{{`.

### Step 3: Write the packages

Invoke `jig:structure` with the Skill tool before you place a file. Then:

1. `packages/eslint-config`: copy `assets/eslint-config/` whole, with `{{SCOPE}}` replaced. Every app's `eslint.config.mjs` is one line: `export { default } from "{{SCOPE}}/eslint-config/next";`. A package's config imports `gates(["src"])` from `{{SCOPE}}/eslint-config/gates`.
2. `packages/db`: Drizzle + postgres.js, `src/schema/`, `src/client.ts`, `drizzle.config.ts`, the PGlite test harness from the **Backend test setup** section of `jig:backend-tests` (invoke it). Scripts: `with-env` (`dotenv -e ../../.env --`), `db:generate`, `db:migrate`, `db:push` (`pnpm with-env drizzle-kit push --force`: no prompt, so a builder runs it unattended), `db:studio`, `db:check` (`pnpm with-env node scripts/db-check.mjs`, from `assets/db/db-check.mjs`), `test`, `test:run`, `lint`, `typecheck`.
   `src/client.ts` opens one postgres.js client with `max: Number(process.env.DATABASE_POOL_MAX) || 4`. The session pooler gives the project a fixed number of connections (15 on the smallest Supabase size), and every app server shares them: 4 for each app leaves room for a script. The client lives on `globalThis` in each environment (`globalThis.x ??= postgres(...)`): a dev reload evaluates the module again, and a build puts a copy of it in each server bundle, so a client that is not on `globalThis` opens one pool for each copy and passes the limit of the pooler. The client sends each statement with parameters as a prepared statement: drizzle calls `unsafe(sql, params)`, postgres.js then asks the server for the parameter types before each run, and each statement takes two round trips (measured on a remote database: 397 ms against 190 ms). Wrap `unsafe` so that a call with parameters and no options gets `{ prepare: true }`. This is correct on a session pooler and on a direct connection; a transaction pooler needs `prepare: false`. The e2e run is one more server on the same pooler: its config sets `DATABASE_POOL_MAX`.
3. `packages/trpc`: `init.ts` with `createTRPCRouter`, `baseProcedure`, `createCallerFactory`, the `Context` type and the `errorFormatter` that answers one fixed sentence for an `INTERNAL_SERVER_ERROR`, per `jig:backend-standards` (invoke it).
4. `packages/ui`: `npx shadcn@latest init` with the theme the project names, or the default; every app imports from `{{SCOPE}}/ui`.

Each package has `package.json` with `lint`, `typecheck`, `test:run` (where it has tests), a `tsconfig.json` that extends `../../tsconfig.base.json`, and a `vitest.config.ts` where it has tests.

**Gate:** `pnpm -r exec pwd` lists every package, and `pnpm lint` and `pnpm typecheck` pass with no error.

### Step 4: Write the apps

For each app in `{{APPS}}`, in order:

```bash
pnpm create next-app@latest apps/<app> --ts --tailwind --eslint --app --no-src-dir --import-alias "@/*" --use-pnpm
```

Then, per app: name it `{{SCOPE}}/<app>`, set `dev` to `dotenv -e ../../.env -- next dev --port <port>` and `start` to the same with `next start` (Next reads `.env` only from the app's own folder, so without `dotenv` a dev server has no `DATABASE_URL` and every query fails; an app whose address is not the one in `AUTH_URL` puts its own before the command, `AUTH_URL=http://localhost:<port> dotenv …`, because `dotenv` keeps a variable that is already set), add `typecheck` (`tsc --noEmit`), `test` and `test:run`; replace its ESLint config with the one line of Step 3; install the tRPC + TanStack wiring from `jig:frontend-wiring` (invoke it) against `{{SCOPE}}/trpc`. An app has no jsdom harness and no component test: its screens are proved by the end-to-end flows of Step 5 (`jig:e2e-tests`, "The two layers"). Every app's `next.config.ts` sets `experimental: { staleTimes: { dynamic: 300 } }` (frontend-standards 47).

**Gate:** `pnpm build` and `pnpm test` pass for every app and package. Commit: `chore: scaffold the apps and packages`.

### Step 5: Write the e2e package

Invoke `jig:e2e-tests` with the Skill tool. Copy its `assets/e2e/` to `packages/e2e/` (`gitignore` becomes `.gitignore`), with `{{SCOPE}}` replaced. Then:

1. `support/apps.ts`: one row per app in `APPS`, in app order, with the ports 3100, 3101, 3102 … and the width of the app's designs (1440 for a desktop app, 390 for a phone app).
2. `support/session.setup.ts`: one row per app in `SIGN_IN`. An app with no sign-in yet has the empty function.
3. `flows/web/home.spec.ts` is the first flow: move it to `flows/<app>/home.spec.ts` for each app.
4. `mkdir -p docs/designs`: the design source files of the screens go there (`<Screen>.dc.html`, `canvas.json`).
5. `pnpm install`, then `pnpm exec playwright install chromium` in `packages/e2e`: only the browser the suite uses.
6. The redirect list of a sign-in provider gets the origin of each e2e port beside each dev origin: `http://localhost:3100` and up. A repo with no such provider yet gets them when the provider is set up. The CORS of a storage bucket gets no e2e port: a flow that uploads carries the upload itself (`carryUploads`, the `e2e-tests` skill).

**Gate:** `pnpm lint` and `pnpm typecheck` pass with `packages/e2e` in the list, and `grep -r '{{' packages/e2e` prints nothing. Commit: `chore: scaffold the e2e package`.

### Step 6: Prove the environment

This step exists because an unreachable database or a missing login surfaces at the developer's first manual check, after a whole checklist is built. Prove each one now:

1. `.env`: copy `.env.example` to `.env`, generate `AUTH_SECRET` with `openssl rand -base64 32`. Ask the developer for the Supabase session-pooler URI (dashboard → Connect → Session pooler, port 5432) when `DATABASE_URL` is empty. Never probe a local Postgres or Docker: the database is the Supabase project.
2. `pnpm --filter {{SCOPE}}/db db:check` prints `db ok`. Then `pnpm --filter {{SCOPE}}/db db:push` prints `Changes applied`. The script carries `--force`, so it never waits on a prompt: you run it, and never hand it to the developer.
3. `gh auth status` shows a logged-in account.
4. For each app, `APP=<app> pnpm flows` prints `1 passed`: the run built the app, started it headless on its e2e port and opened the home page with no error. This is the one time a scaffold starts a server, and the run stops it.

**Gate:** the transcript shows `db ok`, the push's table list, the `gh` login line, and one `passed` line per app.

### Step 7: Push to GitHub and watch the first run

```bash
gh repo create <owner>/{{REPO}} --private --source=. --remote=origin --push
id=$(gh run list --branch main --event push --commit $(git rev-parse HEAD) --json databaseId -q '.[0].databaseId')
gh run watch "$id" --exit-status
```

The pre-push hook runs the flows of each app that the push can change, before the push leaves the machine. Each pushed commit has its own run: the `ci` workflow has no `concurrency` group, so no later push cancels it. The `ci` run has no database and runs no flow. A failed run is this skill's to fix, in a new commit and push, before the report.

**Gate:** the run's conclusion is `success`.

### Step 8: Report

One line each: the repo URL, the CI run URL with `success`, the apps with their ports, the `.env` keys that are filled and the ones the developer still fills, and the first command to run next (`/jig:implementation-planner docs/spec/<first spec>.md`).

## Existing repo

When the folder already holds code, Step 2, Step 3 and Step 5 add only what is missing and change only what differs from the assets: diff each asset against its file in the repo, and replace the repo's copy. In `packages/e2e`, the rows of `support/apps.ts` and `support/session.setup.ts`, the sender keys of `playwright.config.ts`, the measured `workers` number and each flow are the repo's own: keep them. Never touch `apps/` or `packages/` code beyond the ESLint config line and the scripts the gates need. Report each replaced file.

## Don't — common failures

- Don't point `.env.example` at a local Postgres. The database is the Supabase project; a local URL sends the developer to a server that does not exist.
- Don't skip Step 6 because the tests are green. The backend tests run on PGlite; only `db:check` and the first flow prove the real database and the built app.
- Don't add a jsdom or MSW harness, or a test that renders a component. There are two test layers: backend tests and end-to-end tests.
- Don't run the e2e tests on a dev port or on a server that already runs. The run starts its own build on port 3100 and up.
- Don't write a PR-based `CLAUDE.md`. The `open-feature-pr` skill reads the straight-to-main line to choose its push path.
- Don't run the CI only on pull requests. There are none; it runs on every push to main.
- Don't hand-edit a convention in the repo without the same change in `assets/`.
- Don't use the transaction pooler URI (port 6543) for `DATABASE_URL`: postgres.js prepared statements fail on it.
- Don't write `db:push` without `--force`, and don't hand a database command to the developer. A builder runs unattended: a prompt or a hand-off stops the goal until someone returns to the screen.

## Verify

- [ ] Every decision of Step 1 is written in the output, and no fixed row was asked.
- [ ] Every file in `assets/root/`, `assets/husky/` and `assets/github/`, and every file of the `e2e-tests` skill's `assets/e2e/`, has its copy in the repo, placeholders replaced, no `{{` left (`grep -r '{{' --exclude-dir=node_modules .` prints nothing).
- [ ] `.husky/pre-push` runs `pnpm flows` for each app that the push can change, and no app has a jsdom or MSW setup.
- [ ] `CLAUDE.md` holds the straight-to-main rule and names this skill as the source of the conventions.
- [ ] `pnpm lint`, `pnpm typecheck`, `pnpm build`, `pnpm test` pass, and the first commit passed the hooks.
- [ ] `db:check` printed `db ok`, `gh auth status` is logged in, and `pnpm flows` printed `1 passed` for each app.
- [ ] The GitHub repo exists, main is pushed, and the first `ci` run is `success`.
