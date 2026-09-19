---
description: "implementation-planner: search narrowing is a Backend task"
tags: [obedience, planning]
runs: 1
max_turns: 10
timeout_seconds: 420
allowed_tools: [Read, Glob, Grep, Skill]
---

If a skill named `implementation-planner` is available to you, invoke it with the Skill tool before you answer. If it is not available, answer without it.

Spec, section 3, Home page: "The page shows the five most recent open jobs of the workspace, each with its five newest candidates. A search box above the list filters the jobs by title or by candidate name as the user types. When nothing matches, the list shows 'No jobs to show'."

The stack is Next.js App Router + tRPC v11 + TanStack Query v5 + Drizzle. `home.overview()` exists and returns the five jobs with their candidates.

Write only the `## Backend` and `## Frontend + Integration` task lists of the implementation checklist for this slice. Do not write any file.
