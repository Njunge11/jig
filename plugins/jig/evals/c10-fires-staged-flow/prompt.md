---
description: "a staged flow that never says machine fires state-machines"
tags: [triggering]
runs: 1
max_turns: 4
timeout_seconds: 420
allowed_tools: [Read, Glob, Grep, Skill]
---

A job draft moves through three stages: collecting details, in review, and published. While details are being collected, Submit sends the draft to review. In review, Approve publishes it and Back returns it to collecting. Once published, Submit and Back do nothing, and the Edit button no longer shows. The server keeps where each draft is between requests, in Postgres through Drizzle.

Design the server module that moves a draft on Submit, Approve and Back, and the React panel that shows the form for the draft's current stage. Do not write any file. Reply with the design and the code.
