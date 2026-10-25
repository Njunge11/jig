---
description: "structure: every file of a new feature lands in the tree"
tags: [obedience, structure, regression]
max_turns: 40
timeout_seconds: 1200
allowed_tools: [Read, Glob, Grep, Skill, Write, Edit, Bash]
---

If a skill named `structure` is available to you, invoke it with the Skill tool before you start. If it is not available, work without it.

The working directory is a store app: Next.js App Router, tRPC v11, TanStack Query v5, Drizzle and nuqs. The app's tRPC root is `lib/trpc/routers/_app.ts`, and its tables are in `db/schema/`.

Add a feature `invites`: a store owner invites a person by email to help run the store. It needs a tRPC router for the `invitation` resource, a service, a repository, a Drizzle table, and a page at `/invites` that lists the store's invitations in a data table with a search by email.

Do not write or change tests.
