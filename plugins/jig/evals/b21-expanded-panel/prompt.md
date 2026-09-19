---
description: "recipe-expanded-panel: one mounted tree, one boolean, no overlay"
tags: [obedience, frontend]
runs: 1
max_turns: 8
timeout_seconds: 420
allowed_tools: [Read, Glob, Grep, Skill]
---

If a skill named `recipe-expanded-panel` is available to you, invoke it with the Skill tool before you answer. If it is not available, answer without it.

The app is Next.js App Router + tRPC v11 + TanStack Query v5 + Drizzle + shadcn/ui. The job wizard shows a description editor panel beside a preview column. Add a maximize mode: the editor panel fills the workspace, and a second click restores it. Text that the user typed and the scroll position must survive each toggle.

Do not write any file. Reply with the full code of every file you add or change.
