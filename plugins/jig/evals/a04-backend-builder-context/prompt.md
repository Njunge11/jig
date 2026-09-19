---
description: "the backend builder has the entry rules in context"
tags: [delivery]
runs: 1
max_turns: 6
timeout_seconds: 420
allowed_tools: [Agent]
---

Spawn one subagent with the Agent tool, subagent_type exactly `jig:backend-feature-builder`, and wait for its result. Give it this prompt verbatim:

"Use no tool. Answer only from the text that is already in your context. For each item give a word-for-word quote, or the words NOT IN CONTEXT. (1) The rule on where an eve tool declares execute, and the error a wrong declaration throws. (2) The default of destructiveHint for an MCP tool. (3) The default retry count of a workflow step."

Then print the subagent's answer verbatim and nothing else. If that subagent type does not exist, reply with the words NO SUCH AGENT.
