---
description: "implementation-planner: search narrowing is a Backend task"
tags: [obedience, planning, regression]
max_turns: 40
timeout_seconds: 1200
allowed_tools: [Read, Glob, Grep, Skill, Write, Edit, Bash]
---

If a skill named `implementation-planner` is available to you, invoke it with the Skill tool, with `docs/home/spec.md` as its argument, before you start. If it is not available, work without it.

The working directory is a store app: Next.js App Router, tRPC v11, TanStack Query v5, Drizzle and shadcn/ui. The spec `docs/home/spec.md` describes a search on the Home page, `app/page.tsx`.

Plan the spec: write its implementation checklist and its tracker. The developer is not in this session to answer questions. The spec is complete, so do not stop to ask.
