---
description: "implementation-planner: search narrowing is a Backend task"
tags: [obedience, planning]
runs: 1
max_turns: 10
timeout_seconds: 420
allowed_tools: [Read, Glob, Grep, Skill]
---

If a skill named `implementation-planner` is available to you, invoke it with the Skill tool before you answer. If it is not available, answer without it.

Spec, section 3: "The Home page lists the open jobs of the workspace, five at a time. A search box finds a job by title or by a candidate's name. A search with no match shows 'No jobs to show'." The clickable prototype that came with the spec filters the five fetched jobs in the browser.

Write only the `## Backend` and `## Frontend + Integration` task lists of the implementation checklist for this slice. Do not write any file.
