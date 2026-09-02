# next-trpc-drizzle

A Claude Code plugin: a test-first engineering playbook for the **Next.js + tRPC + Drizzle** stack (the T3-style stack, plus TanStack Query, shadcn/ui + Tailwind, and Vitest). It ships **11 skills**: a spec → tracker → PR pipeline (plan, build, review, open the PR) plus the standards for structure, backend, and frontend work.

## Install

In Claude Code, add this repo as a marketplace, install the plugin, then reload:

```text
/plugin marketplace add Njunge11/next-trpc-drizzle
/plugin install next-trpc-drizzle@mita-labs-plugins-official
/reload-plugins
```

Needs a recent Claude Code (the `/plugin` command). To try it locally without installing, run `claude --plugin-dir ./plugins/next-trpc-drizzle`.

## Use

Once installed, each skill loads **automatically** when your task matches its description. You can also invoke any skill explicitly by its namespaced name:

```text
/next-trpc-drizzle:<skill>      # e.g. /next-trpc-drizzle:frontend
```

| Skill | Use when |
| --- | --- |
| `implementation-planner` | You have a spec doc and want it split into a tracker plus one-PR implementation checklists. |
| `implement-backend` | Building a feature's backend test-first — drives its checklist + TDD loop to a green backend suite. |
| `implement-steps` | Executing a step implementation checklist — structure-only work driven to green standing checks and an open PR. |
| `review-backend-feature` | Reviewing a built backend against the backend-standards and backend-tests Review checklists; fixes violations and pushes. |
| `review-frontend-feature` | Reviewing a built frontend against the frontend skill's Rules and the matching recipes' Verify lists; fixes violations and pushes. |
| `open-feature-pr` | An implementation checklist's work is complete and its PR must be opened — owns branch/title/body conventions. |
| `structure` | Deciding where any file lives — the feature tree and placement rules; structure never comes from existing code. |
| `backend-standards` | Writing or reviewing backend code — entry points → service → repository → Drizzle, queries, transactions, migrations. |
| `backend-tests` | Writing, reviewing, or planning backend tests — PGlite repos, fake-repo services, entry points through real interfaces. |
| `frontend` | Any frontend work — pages, components, forms, tables, chat, queries, mutations, loading/error UI, styling. Picks the matching recipe and builds to the invariants. |
| `skill-audit` | Auditing a skill (or a plugin's skills) against the built-in quality checklist and fixing the failures. |

## Workflow

**Spec → tracker → PRs, test-first.** You stay in control at every handoff.

1. **Plan** — run `/next-trpc-drizzle:implementation-planner <spec doc>`. It audits the repo, asks about the spec's open decisions, and writes a tracker plus implementation checklists — one checklist = one PR, each with its `/goal` run command.
2. **Build** — run a checklist's `/goal` command from the tracker. A TDD checklist (work that changes behavior) runs `implement-backend`; a step checklist (structure-only work) runs `implement-steps`.
3. **Review** — `review-backend-feature` (backend) or `review-frontend-feature` (frontend) walks its rubric against the PR's diff, fixes violations in place, pushes, and reports a per-item verdict.
4. **Open the PR** — `open-feature-pr` owns the branch, title, and body conventions.

**Frontend work** loads the `frontend` skill: identify what you are building, load the matching recipe from its catalog, build to its invariants, and verify in the browser at 375 / 768 / 1024 / 1440px.

> **About `/goal`:** a Claude Code harness command (v2.1.139+) **you** run to keep the agent working autonomously until a condition holds — it loops after each turn until satisfied or you `/goal clear`. Its evaluator only reads the session transcript; it can't open files or run commands, so the condition must be something the agent **proves in its output**. The build skills handle that for you — they surface the checklist state and paste the test run — which is why the prompt can stay this short. Append a cap like `… or stop after 25 turns` if you want a hard turn limit.

## License

MIT
