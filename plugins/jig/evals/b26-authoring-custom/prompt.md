---
description: "frontend-authoring-custom: compound parts, controllable state, data attributes"
tags: [obedience, frontend, regression]
max_turns: 40
timeout_seconds: 1200
allowed_tools: [Read, Glob, Grep, Skill, Write, Edit, Bash]
---

If a skill named `frontend-authoring-custom` is available to you, invoke it with the Skill tool before you start. If it is not available, work without it.

The working directory is a store app: Next.js App Router, tRPC v11, TanStack Query v5, react-hook-form and shadcn/ui, with the kit in `components/ui/`.

shadcn/ui has no star-rating component, and you were told to build a custom one in the kit's style: `Rating`, with five selectable items, usable in a form.

Do not write or change tests.
