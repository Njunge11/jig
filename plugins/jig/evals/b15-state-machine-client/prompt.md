---
description: "state-machines: render from hasTag and meta, no stage table"
tags: [obedience, frontend]
runs: 1
max_turns: 8
timeout_seconds: 420
allowed_tools: [Read, Glob, Grep, Skill]
---

If a skill named `state-machines` is available to you, invoke it with the Skill tool before you answer. If it is not available, answer without it.

The server owns an XState v5 machine for a job draft and stores its snapshot. States `collecting`, `reviewing` and `published` exist; `collecting` and `reviewing` carry the tag `editable`; each state's `meta` names the form to show. The page receives the stored snapshot as a prop.

Write the React client part that shows the right form and an Edit button only while the draft is editable. Do not write any file. Reply with the code.
