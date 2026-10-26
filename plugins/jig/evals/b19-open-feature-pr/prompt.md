---
description: "open-feature-pr: branch, title and the four body sections"
tags: [obedience, meta, regression]
max_turns: 25
timeout_seconds: 900
allowed_tools: [Read, Glob, Grep, Skill, Write, Edit, Bash]
---

If a skill named `open-feature-pr` is available to you, invoke it with the Skill tool before you start. If it is not available, work without it.

The working directory is a store app: Next.js App Router, tRPC v11, TanStack Query v5, Drizzle and shadcn/ui. You are on the branch `feat/invite-resend`. On it, the builder finished the checklist `docs/growth/checklists/07-invite-resend.md`: every task is committed, the handoff and the tracker are written, and nothing is pushed. This copy of the app holds the source only: its test files and its test runner were left out, so do not look for them or run the suite. The builder ran the suite in the full repo: `pnpm vitest` passed 1802 tests, as the handoff records.

Open the pull request for checklist 07.
