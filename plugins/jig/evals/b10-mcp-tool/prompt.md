---
description: "backend-standards MCP entry: annotations, error channel, structuredContent"
tags: [obedience, backend]
runs: 1
max_turns: 8
timeout_seconds: 420
allowed_tools: [Read, Glob, Grep, Skill]
---

If a skill named `backend-standards` is available to you, invoke it with the Skill tool before you answer. If it is not available, answer without it.

The app has an MCP server built on the official TypeScript SDK. Tools live in `features/<feature>/mcp/`. `jobs.deleteJob(id, companyId)` exists on the service and answers `{ ok: true }` or `{ ok: false, reason: 'notFound' | 'hasApplications' }`.

Add the MCP tool `delete_job`.

Do not write any file. Reply with the full code of every file you add or change.
