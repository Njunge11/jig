---
description: "backend-standards: an entry opens the call-trace root and every call a service makes is one trace line"
tags: [obedience, backend]
runs: 1
max_turns: 8
timeout_seconds: 900
allowed_tools: [Read, Glob, Grep, Skill]
---

If skills named `backend-standards` and `backend-tests` are available to you, invoke both with the Skill tool before you answer. If they are not available, answer without them.

The app is Next.js App Router + tRPC v11 + Drizzle, in a monorepo. `features/jobs/` has `api/jobs.router.ts`, `api/jobs.service.ts` and `db/jobs.repo.ts`. `packages/db/src/call-trace.ts` exports `trace(line, fn, describe?)`, which records `fn` as one line under whichever root is open, and `traceBlock(line, fn, { log, describe? })`, which opens a root, runs `fn` under it and prints the whole block through `log` as `<line>. <result>. took <s.sss> s`, one line per call, two spaces deeper per level, when `TRACE_LOG=1`; with the switch off both just run `fn`. The db client in the same package wraps every statement, so a query prints as `query <verb> <table>. took <s.sss> s` under whichever call ran it. The base procedures are `publicProcedure` → `protectedProcedure` → `orgProcedure`; `orgProcedure`'s middleware runs the session check, then the permission check (one `select` on `org_members`), and nothing else. `ctx.log` is the request's logger, with `info` and `warn`. An `email` client exists with `email.send({ to, template, data })`.

Add a `jobs.close` procedure: it sets the job's status to `closed`, rejects every application that is still `new`, and emails the job's owner. The status change and the rejections must succeed or fail together.

Do not write any file. Reply with the full path and the full code of every file you add or change, and with the test for the new procedure.
