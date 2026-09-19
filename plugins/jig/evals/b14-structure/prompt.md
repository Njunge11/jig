---
description: "structure: every file of a new feature lands in the tree"
tags: [obedience, structure]
runs: 1
max_turns: 8
timeout_seconds: 420
allowed_tools: [Read, Glob, Grep, Skill]
---

If a skill named `structure` is available to you, invoke it with the Skill tool before you answer. If it is not available, answer without it.

A new feature `invites` needs: a tRPC router for the `invitation` resource, a service, a repository, a Drizzle table, a page at `/invites` with a data table and a search, one behavior test for the table, and one repo test.

Give the full path of every file that the feature and its route need. Do not write any file.
