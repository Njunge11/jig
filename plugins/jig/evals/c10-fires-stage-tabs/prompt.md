---
description: "stage tabs on a list page fire state-machines"
tags: [triggering]
runs: 1
max_turns: 4
timeout_seconds: 420
allowed_tools: [Read, Glob, Grep, Skill]
---

The `applications.status` column stores the stage of each application: `needs_review`, `shortlisted` or `not_a_match`. The candidates list page reads each row's status and the count of each stage from `trpc.candidatesList.list`.

Write the candidates page's tabs: Longlisted, Shortlisted and Not a match, each with its count, with the active tab in the URL. Do not write any file. Reply with the code.
