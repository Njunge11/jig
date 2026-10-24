# jig

## What jig is

Jig is a Claude Code plugin that turns a spec into tested, reviewed pull requests. You write the spec. Jig splits it into checklists, builds each checklist test-first, reviews the diff against fixed standards, and opens the PR. The name comes from the factory tool: a jig guides the work so two builders produce the same part.

## Jig is opinionated

Jig ships one code structure and one set of rules. The `structure` skill owns where every file lives, and the standards skills own how each layer is written. The rules win over the code in the repo — existing code is never a precedent.

- **New project:** works from the first PR. Every file lands in jig's structure.
- **Existing project:** jig works, but it moves your code toward its structure — it does not adapt to yours. A surface that violates the rules gets reworked through a step checklist.

Every skill loads on its own with `/jig:<skill>`. This table shows which ones carry the structure opinion. A **No** row is safe in isolation — it never moves your files. A **Partly** row applies its rules without touching your structure, but its setup reference names jig's paths.

| Skill | Imposes jig's structure? |
| --- | --- |
| `structure` | Yes — it is the structure. |
| `backend-standards` | Yes — places every file by the structure tree. |
| `frontend-standards` | Yes — places every file by the structure tree. |
| `implement-backend` | Yes — the lane loads the structure skill with the Skill tool in its first step. |
| `implement-frontend` | Yes — the lane loads the structure skill with the Skill tool in its first step. |
| `implement-steps` | Yes — the lane loads the structure skill with the Skill tool in its first step. |
| `review-backend-feature` | Yes — the review walks the structure tree over the diff. |
| `review-frontend-feature` | Yes — the review walks the structure tree over the diff. |
| `implementation-planner` | Yes — it writes `docs/<project>/`, and its checklists run the lanes above. |
| `backend-tests` | Partly — the test-quality rules are structure-free; the harness setup expects tests in `features/**/{api,db}/__tests__/`. |
| `frontend-tests` | Partly — the test-quality rules are structure-free; the harness setup expects tests in `features/**/ui/__tests__/`. |
| `open-feature-pr` | No — branch, title, and body conventions only. |
| `state-machines` | No — XState rules for the machine module, the server that moves it, and the React client that renders it. |
| `skill-audit` | No — it audits skills, not your code. |
| `frontend-wiring`, `frontend-authoring-custom` | No — the one-time tRPC wiring and the custom-component rules. The frontend lanes and the frontend review load each one when the work touches it, so they are not in the `/` menu. |
| `recipe-*` (11 skills) | No — each holds the build order and the Verify list of one frontend surface. The frontend lanes and the frontend review load each one whose catalog row matches the work, so they are not in the `/` menu. |

## Human in the loop — on purpose

Jig does the heavy lifting. It plans the checklists, writes the tests and the code, runs the suites, opens the PRs, and reviews every diff item by item against the standards. You do not write the code, and you do not walk the review checklists.

Your job is judgment at the checkpoints: answer the spec's open decisions, start each checklist, read each review verdict, and merge. The one hands-on task left is the checklist's `Manual verification` items — browser checks jig does not automate yet.

With more refinement and iteration, jig can automate more of the pipeline. The direction: you hand jig a spec, and it works through the checklists autonomously, manages its own handoffs and worktrees, and returns reviewed PRs for you to merge.

## Tech stack

Jig's standards and recipes target one stack:

- Next.js (App Router)
- tRPC
- Drizzle ORM + PostgreSQL
- TanStack Query v5
- shadcn/ui + Tailwind CSS
- Vitest — PGlite for backend tests, jsdom + MSW for UI tests

## How to install

Run these three commands in Claude Code:

```text
/plugin marketplace add Njunge11/jig
/plugin install jig@mita-labs-plugins-official
/reload-plugins
```

To try it without installing, start Claude Code from this repo with `claude --plugin-dir ./plugins/jig`.

## How to use

The workflow, end to end:

```mermaid
flowchart TD
    S[Spec doc] --> P[implementation-planner]
    P --> T["tracker.md + checklists — one checklist = one PR"]
    T -->|"backend TDD /goal"| B[implement-backend]
    T -->|"frontend TDD /goal"| F[implement-frontend]
    T -->|"step /goal"| SL[implement-steps]
    B --> R["read-only review in a subagent — review-backend-feature or review-frontend-feature"]
    F --> R
    SL --> R
    R --> X[the /goal session fixes every fail line in one commit]
    X --> O[open-feature-pr pushes once and opens the PR]
    O --> M[you read the verdict and merge]
```

Example: your spec is `docs/growth/spec.md`.

1. **Plan.** Run `/jig:implementation-planner docs/growth/spec.md`. The planner audits the repo, asks you about the spec's open decisions, then writes `docs/growth/tracker.md` and one checklist per PR. Each tracker row carries a `/goal` run command.
2. **Build.** Copy one checklist's `/goal` command from the tracker and run it. The command starts the right lane — `implement-backend`, `implement-frontend`, or `implement-steps` — and keeps it working until every Done item is proven in the transcript. The lane runs in the `/goal` session itself: it loads its standards, builds test-first, and runs an independent, read-only review in a subagent that reports a per-item verdict. The session fixes every `fail` line, then pushes the branch once and opens the PR. A slice with a Backend and a Frontend section builds both in the same session and opens one PR.
3. **Merge.** Read the PR and the review verdict, then merge.

You can also invoke any skill directly with `/jig:<skill>` — for example `/jig:frontend-standards` loads the frontend rules while you work by hand. Skills also load automatically when your task matches their descriptions.

## License

MIT
