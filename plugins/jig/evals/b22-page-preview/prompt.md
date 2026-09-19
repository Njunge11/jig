---
description: "recipe-page-preview: share the real render component, no cross-app iframe"
tags: [obedience, frontend]
runs: 1
max_turns: 10
timeout_seconds: 420
allowed_tools: [Read, Glob, Grep, Skill]
---

If a skill named `recipe-page-preview` is available to you, invoke it with the Skill tool before you answer. If it is not available, answer without it.

A pnpm monorepo has two Next.js apps: `apps/dashboard` (the job wizard) and `apps/job-board` (the public job page), and a shared package `packages/ui` that exports raw `.tsx`.

The wizard needs a live preview of the public job page, beside the form, that updates as the user types. The job description is HTML that the user pasted.

Describe the design and give the code of the key files. Do not write any file.
