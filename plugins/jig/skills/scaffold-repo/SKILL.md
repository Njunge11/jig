---
name: scaffold-repo
description: Sets up a new repo for the jig pipeline in one run, so the first checklist builds on a working baseline. It writes the Turborepo workspace, the Next.js apps and the db, trpc and ui packages, the Playwright e2e package with a first flow, the Lefthook hooks (bun fmt, oxlint, the typecheck, commitlint and the pre-push e2e run), the oxlint gates, the CI workflow, CLAUDE.md with the straight-to-main rule, .env.example, then proves the database answers and the first flow passes, pushes main to GitHub and watches the first CI run go green. Use when the developer runs /jig:scaffold-repo, asks to scaffold, bootstrap, set up or create a new repo, project or monorepo for the jig stack, or asks to bring an existing repo's setup (hooks, CI, CLAUDE.md, gates, the lint, typecheck or format tools) up to the jig standard.
argument-hint: "[repo name] [--apps admin,supplier] [--scope @cra] [--dir path]"
---

# Scaffold repo

Set up one repo so that every later skill finds what it expects: the hooks, the CI check, the `CLAUDE.md` rules, the tools of each check (the table below), the lint gates, the two test layers (backend tests and end-to-end tests), a reachable database and a green first run on GitHub. Nothing in this skill is a template to adapt by hand: the files under `assets/` are the standard, and a repo that differs from them is the one that changes.

| Check | Tool | Command |
| --- | --- | --- |
| Lint | oxlint, with the jig gates as a JS plugin (`packages/lint-config`) | `pnpm lint` |
| Types | `bun check`, the type checker of Bun | `pnpm typecheck` |
| Format | `bun fmt`, the formatter of Bun | `pnpm format`, `pnpm format:check` |
| Backend tests | Vitest on PGlite | `pnpm test`, `pnpm test:changed` |
| Hooks | Lefthook (`lefthook.yml`) | each commit and each push |
| All of the `ci` tasks, in one parallel turbo run | turbo | `pnpm verify` |

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
| Database | one Supabase project, session pooler. The end-to-end run alone uses a PostgreSQL server that it starts on the machine | fixed |
| Git flow | straight to main, no PRs | fixed |
| Node | 24 | fixed |
| GitHub | private repo under the developer's account | fixed |

Ask only for a decision with no argument and no default, in one `AskUserQuestion` call. Never ask about a fixed row. The shape is always the Turborepo workspace (`apps/*`, `packages/*`), also for one app: one shape keeps every later skill's paths true.

**Gate:** every row of the table has a value, written in your output.

### Step 2: Write the repo root

Create the folder when it does not exist, and `git init -b main` when it is not a repo. Copy every file of `assets/root/` to the root: `gitignore` becomes `.gitignore`, `nvmrc` becomes `.nvmrc`, `env.example` becomes `.env.example`. Replace `{{REPO}}`, `{{SCOPE}}`, `{{PROJECT}}`, `{{ONE_LINE}}` and `{{APPS_SENTENCE}}` in `package.json` and `CLAUDE.md` (`{{APPS_SENTENCE}}` is the apps named with their ports: "Two Next.js apps, admin (3000) and supplier (3001),"). Copy `assets/lefthook/lefthook.yml` to the root, `assets/lefthook/pre-push/e2e.sh` to `.lefthook/pre-push/e2e.sh` with `{{APP_NAMES}}` replaced by the app names with a space between them (`admin supplier`), and `assets/github/ci.yml` to `.github/workflows/ci.yml`. Then:

```bash
pnpm install          # the install script of lefthook installs the hooks
git add -A && git commit -m "chore: scaffold the repo root"
```

**Gate:** the commit passes the hooks (its output shows the `format` job and the `commitlint` job, and the subject is lower case). `pnpm exec lefthook validate` prints no error, `pnpm format:check` exits `0`, and `.lefthook/pre-push/e2e.sh` holds no `{{`.

### Step 3: Write the packages

Invoke `jig:structure` with the Skill tool before you place a file. Then:

1. `packages/lint-config`: copy `assets/lint-config/` whole, with `{{SCOPE}}` replaced. Every app's `oxlint.config.ts` is one line: `export { default } from "{{SCOPE}}/lint-config/next";`. The `oxlint.config.ts` of a package with its code in `src/` is one line: `export { default } from "{{SCOPE}}/lint-config/package";`. Each of them has `{{SCOPE}}/lint-config` as a dev dependency (`workspace:*`), the script `"lint": "oxlint"`, and its `oxlint.config.ts` in the `include` of its `tsconfig.json`.
2. `packages/db`: Drizzle + postgres.js, `src/schema/`, `src/client.ts`, `drizzle.config.ts`, the PGlite test harness from the **Backend test setup** section of `jig:backend-tests` (invoke it). Scripts: `with-env` (`dotenv -e ../../.env --`), `db:generate`, `db:migrate`, `db:push` (`pnpm with-env drizzle-kit push --force`: no prompt, so a builder runs it unattended), `db:studio`, `db:check` (`pnpm with-env node scripts/db-check.mjs`, from `assets/db/db-check.mjs`), `test`, `test:run`, `test:changed`, `lint`, `typecheck`.
   `src/client.ts` opens one postgres.js client with `max: Number(process.env.DATABASE_POOL_MAX) || 4`. The session pooler gives the project a fixed number of connections (15 on the smallest Supabase size), and every app server shares them: 4 for each app leaves room for a script. The client lives on `globalThis` in each environment (`globalThis.x ??= postgres(...)`): a dev reload evaluates the module again, and a build puts a copy of it in each server bundle, so a client that is not on `globalThis` opens one pool for each copy and passes the limit of the pooler. The client sends each statement with parameters as a prepared statement: drizzle calls `unsafe(sql, params)`, postgres.js then asks the server for the parameter types before each run, and each statement takes two round trips (measured on a remote database: 397 ms against 190 ms). Wrap `unsafe` so that a call with parameters and no options gets `{ prepare: true }`. This is correct on a session pooler and on a direct connection; a transaction pooler needs `prepare: false`. The e2e run is one more server on the same pooler: its config sets `DATABASE_POOL_MAX`.
3. `packages/trpc`: `init.ts` with `createTRPCRouter`, `baseProcedure`, `createCallerFactory`, the `Context` type and the `errorFormatter` that answers one fixed sentence for an `INTERNAL_SERVER_ERROR`, per `jig:backend-standards` (invoke it).
4. `packages/ui`: `npx shadcn@latest init` with the theme the project names, or the default; every app imports from `{{SCOPE}}/ui`.

Each package has `package.json` with `lint` (`oxlint`), `typecheck` (`bun check --no-script`: with no flag, `bun check` runs a script named `check` when the package has one), and where it has tests `test` (`vitest`), `test:run` (`vitest run`) and `test:changed` (`vitest run --changed origin/main --passWithNoTests`). It has a `tsconfig.json` that extends `../../tsconfig.base.json`, and a `vitest.config.ts` where it has tests.

**Gate:** `pnpm -r exec pwd` lists every package, and `pnpm lint` and `pnpm typecheck` pass with no error.

### Step 4: Write the apps

For each app in `{{APPS}}`, in order:

```bash
pnpm create next-app@latest apps/<app> --ts --tailwind --no-linter --app --no-src-dir --import-alias "@/*" --use-pnpm
```

Then, per app: name it `{{SCOPE}}/<app>` and set `"type": "module"` (Node loads `oxlint.config.ts` as a module, and prints a warning on each lint when the type is missing); delete the `pnpm-workspace.yaml`, the `AGENTS.md` and the `README.md` that the command writes in the app folder (a second workspace file makes pnpm read the app as its own workspace); set `dev` to `dotenv -e ../../.env -- next dev --port <port>` and `start` to the same with `next start` (Next reads `.env` only from the app's own folder, so without `dotenv` a dev server has no `DATABASE_URL` and every query fails; an app whose address is not the one in `AUTH_URL` puts its own before the command, `AUTH_URL=http://localhost:<port> dotenv …`, because `dotenv` keeps a variable that is already set), add `lint` (`oxlint`), `typecheck` (`next typegen && bun check --no-script`), `test`, `test:run` and `test:changed` (the commands of Step 3); write its `oxlint.config.ts`, the one line of Step 3; set `typescript: { ignoreBuildErrors: true }` in `next.config.ts`, because `pnpm typecheck` is the one type check and `next build` otherwise checks the types a second time; write `test/caller.ts` from the **Router tests** section of `jig:backend-tests`; install the tRPC + TanStack wiring from `jig:frontend-wiring` (invoke it) against `{{SCOPE}}/trpc`. The page that the command writes joins class names in a template literal, which `pnpm lint` refuses (`frontend-standards` 14): write it with `cn()` from `{{SCOPE}}/ui`. An app has no jsdom harness and no component test: its screens are proved by the end-to-end flows of Step 5 (`jig:e2e-tests`, "The two layers"). Every app's `next.config.ts` sets `experimental: { staleTimes: { dynamic: 300 } }` (frontend-standards 47).

**Gate:** `pnpm verify` passes: lint, typecheck, build and the tests of every app and package, in one turbo run. No app holds an `eslint.config.*` file. Commit: `chore: scaffold the apps and packages`.

### Step 5: Write the e2e package

Invoke `jig:e2e-tests` with the Skill tool. Copy its `assets/e2e/` to `packages/e2e/` (`gitignore` becomes `.gitignore`), with `{{SCOPE}}` replaced. Then:

0. `support/test-database.ts`: replace `{{POSTGRES_MAJOR}}` with the major version of the remote database (`select version()` through `db:check`'s connection; 17 when the project is new), and add one row to `START_DATA` for each seed command of the repo. Install that PostgreSQL when the machine has none: `brew install postgresql@<major>` on macOS (keg-only: it starts no service and changes no other PostgreSQL). You run the install, and never hand it to the developer.
1. `support/apps.ts`: one row per app in `APPS`, in app order, with the ports 3100, 3101, 3102 … and the width of the app's designs (1440 for a desktop app, 390 for a phone app).
2. `support/session.setup.ts`: one row per app in `SIGN_IN`. An app with no sign-in yet has the empty function.
3. `flows/web/home.spec.ts` is the first flow: move it to `flows/<app>/home.spec.ts` for each app.
4. `mkdir -p docs/designs`: the design source files of the screens go there (`<Screen>.dc.html`, `canvas.json`).
5. `pnpm install`, then `pnpm exec playwright install chromium` in `packages/e2e`: only the browser the suite uses.
6. The redirect list of a sign-in provider gets the origin of each e2e port beside each dev origin: `http://localhost:3100` and up. A repo with no such provider yet gets them when the provider is set up. The CORS of a storage bucket gets no e2e port: a flow that uploads carries the upload itself (`carryUploads`, the `e2e-tests` skill).

**Gate:** `pnpm lint` and `pnpm typecheck` pass with `packages/e2e` in the list, and `grep -r '{{' packages/e2e` prints nothing. Commit: `chore: scaffold the e2e package`.

### Step 6: Prove the environment

This step exists because an unreachable database or a missing login surfaces at the developer's first manual check, after a whole checklist is built. Prove each one now:

1. `.env`: copy `.env.example` to `.env`, generate `AUTH_SECRET` with `openssl rand -base64 32`. Ask the developer for the Supabase session-pooler URI (dashboard → Connect → Session pooler, port 5432) when `DATABASE_URL` is empty. Never probe a local Postgres or Docker for the app: the database of `.env` is the Supabase project. The one local server is the test database, which the end-to-end run starts and stops itself.
2. `pnpm --filter {{SCOPE}}/db db:check` prints `db ok`. Then `pnpm --filter {{SCOPE}}/db db:push` prints `Changes applied`. The script carries `--force`, so it never waits on a prompt: you run it, and never hand it to the developer.
3. `gh auth status` shows a logged-in account.
4. For each app, `APP=<app> pnpm flows` prints `1 passed`: the run started its test database, built the app, started it headless on its e2e port and opened the home page with no error. This is the one time a scaffold starts a server, and the run stops it.

**Gate:** the transcript shows `db ok`, the push's table list, the `gh` login line, and one `passed` line per app.

### Step 7: Push to GitHub and watch the first run

```bash
gh repo create <owner>/{{REPO}} --private --source=. --remote=origin --push
id=$(gh run list --branch main --event push --commit $(git rev-parse HEAD) --json databaseId -q '.[0].databaseId')
gh run watch "$id" --exit-status
```

The pre-push hook runs the flow files that the push adds or changes and the smoke set (`@smoke`), before the push leaves the machine. `pnpm flows:all` runs the full suite, outside a push. Each pushed commit has its own run: the `ci` workflow has no `concurrency` group, so no later push cancels it. The `ci` run has no database and runs no flow. A failed run is this skill's to fix, in a new commit and push, before the report.

**Gate:** the run's conclusion is `success`.

### Step 8: Report

One line each: the repo URL, the CI run URL with `success`, the apps with their ports, the `.env` keys that are filled and the ones the developer still fills, and the first command to run next (`/jig:implementation-planner docs/spec/<first spec>.md`).

## Existing repo

When the folder already holds code, Step 2, Step 3 and Step 5 add only what is missing and change only what differs from the assets: diff each asset against its file in the repo, and replace the repo's copy. In `packages/e2e`, the rows of `support/apps.ts` and `support/session.setup.ts`, the sender keys of `playwright.config.ts`, the measured `workers` number and each flow are the repo's own: keep them. Never touch `apps/` or `packages/` code beyond the `oxlint.config.ts` line, the scripts the gates need, and what the next paragraph names. Report each replaced file.

**A repo on older tools.** The standard has one tool for each check (the table at the top). Remove each other one in the same change: the ESLint, Prettier, husky and lint-staged dev dependencies, their config files (`eslint.config.*`, `.prettierrc*`, `lint-staged.config.*`, the `.husky/` folder), the `prepare` script, and each `tsc --noEmit` script. Then:

1. The lines of `.prettierignore` that no `.gitignore` covers go to `ignorePatterns` in `bunfig.toml`, and the file goes.
2. A disable comment names the oxlint rule: `// oxlint-disable-next-line nextjs/no-img-element`, `typescript/no-explicit-any`, `react/exhaustive-deps`.
3. `git config core.hooksPath` prints a path when husky set one, and `lefthook install` then stops. Run `pnpm exec lefthook install --reset-hooks-path` one time: it removes that setting for the main checkout and for each worktree, and installs the hooks.
4. A router test or a fixture that makes its caller from the app router fails `pnpm lint` (`backend-tests` 17): change it to `callerFactoryOf`.

**Gate:** `pnpm format:check` and `pnpm verify` pass, and a commit passes the Lefthook jobs. No file has an old tool in its name: `git ls-files | grep -i -E "eslint|prettier|husky|lint-staged"` prints nothing. No package depends on one: `grep -l -i -E "eslint|prettier|husky|lint-staged" package.json apps/*/package.json packages/*/package.json` prints nothing.

## Don't — common failures

- Don't point `.env.example` at a local Postgres. The database of the app is the Supabase project; a local URL sends the developer to a server that does not exist. The test database is not in `.env`: the end-to-end run makes its URL.
- Don't run the flows on the database of `.env`. It is remote: each statement of each step pays one round trip, and a full suite takes several times longer.
- Don't skip Step 6 because the tests are green. The backend tests run on PGlite; only `db:check` proves the database of `.env`, and only the first flow proves the test database and the built app.
- Don't add a jsdom or MSW harness, or a test that renders a component. There are two test layers: backend tests and end-to-end tests.
- Don't run the e2e tests on a dev port or on a server that already runs. The run starts its own build on port 3100 and up.
- Don't write a PR-based `CLAUDE.md`. The `open-feature-pr` skill reads the straight-to-main line to choose its push path.
- Don't run the CI only on pull requests. There are none; it runs on every push to main.
- Don't hand-edit a convention in the repo without the same change in `assets/`.
- Don't add a second tool for a check: no ESLint, no Prettier, no husky, no lint-staged, no `tsc` script. `next build` does not check the types either (`ignoreBuildErrors`): two type checks of one app cost the build its longest step.
- Don't put a `.mjs`, `.js` or `.ts` file of a package outside the `include` of its `tsconfig.json`. The type-aware lint of the e2e package reads such a file through the nearest tsconfig of a folder above the repo, and a lint of 1 second takes minutes.
- Don't use the transaction pooler URI (port 6543) for `DATABASE_URL`: postgres.js prepared statements fail on it.
- Don't write `db:push` without `--force`, and don't hand a database command to the developer. A builder runs unattended: a prompt or a hand-off stops the goal until someone returns to the screen.

## Verify

- [ ] Every decision of Step 1 is written in the output, and no fixed row was asked.
- [ ] Every file in `assets/root/`, `assets/lefthook/` and `assets/github/`, and every file of the `e2e-tests` skill's `assets/e2e/`, has its copy in the repo, placeholders replaced, no `{{` left (`grep -r '{{' --exclude-dir=node_modules .` prints nothing).
- [ ] `.lefthook/pre-push/e2e.sh` runs the flow files that the push adds or changes and the smoke set, `pnpm flows:all` runs each app, and no app has a jsdom or MSW setup.
- [ ] `CLAUDE.md` holds the straight-to-main rule and names this skill as the source of the conventions.
- [ ] `pnpm format:check` and `pnpm verify` (lint, typecheck, build, the tests) pass, and the first commit passed the Lefthook jobs.
- [ ] The repo holds one tool for each check: no ESLint, Prettier, husky or lint-staged file or dependency, and no `tsc` script.
- [ ] `db:check` printed `db ok`, `gh auth status` is logged in, and `pnpm flows` printed `1 passed` for each app.
- [ ] The GitHub repo exists, main is pushed, and the first `ci` run is `success`.
