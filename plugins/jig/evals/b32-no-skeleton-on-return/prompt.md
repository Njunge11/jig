---
description: "frontend-standards 47: the router keeps a seen page, the nav links prefetch it"
tags: [obedience, frontend, regression]
max_turns: 40
timeout_seconds: 1200
allowed_tools: [Read, Glob, Grep, Skill, Write, Edit, Bash]
---

If a skill named `frontend-standards` is available to you, invoke it with the Skill tool before you start. If it is not available, work without it.

The working directory is a store app: Next.js 16 App Router, tRPC v11, TanStack Query v5, Drizzle and nuqs. Every request reads the session cookie, so every page is dynamic. The side menu is `components/ui/app-sidebar.tsx`.

A user reports: "I open Products, then Home, then Products again. Each click shows the grey skeleton, also on a page I saw a second ago. The app feels slow." The production build shows the same thing. Fix it.

Do not write or change tests.
