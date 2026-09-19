---
description: "eve-agent: docs page first, pnpm exec eve info, never npx"
tags: [obedience, backend]
runs: 1
max_turns: 8
timeout_seconds: 420
allowed_tools: [Read, Glob, Grep, Skill]
---

If a skill named `eve-agent` is available to you, invoke it with the Skill tool before you answer. If it is not available, answer without it.

The app has an eve agent under `agent/`, and `eve` is installed in `apps/dashboard`. You must add a second tool to the agent.

Before you change any file, list in order the first three things you do, with the exact commands. Do not write any file.
