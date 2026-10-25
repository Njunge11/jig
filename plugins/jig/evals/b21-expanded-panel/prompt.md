---
description: "recipe-expanded-panel: one mount, no overlay, one boolean"
tags: [obedience, frontend, regression]
max_turns: 40
timeout_seconds: 1200
allowed_tools: [Read, Glob, Grep, Skill, Write, Edit, Bash]
---

If a skill named `recipe-expanded-panel` is available to you, invoke it with the Skill tool before you start. If it is not available, work without it.

The working directory is a store app: Next.js App Router, tRPC v11, TanStack Query v5, Drizzle and nuqs. The product editor is `app/products/[id]/edit/page.tsx`, and its code is in `features/products/ui/`. It shows a description editor panel beside a preview column.

Add a maximize mode: the editor panel fills the workspace, and a second click restores it. Text that the user typed and the scroll position must survive each toggle.

Do not write or change tests.
