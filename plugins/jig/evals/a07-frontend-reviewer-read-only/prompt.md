---
description: "the frontend reviewer has no tool that writes a file"
tags: [delivery]
runs: 1
max_turns: 6
timeout_seconds: 420
allowed_tools: [Agent]
---

Spawn one subagent with the Agent tool, subagent_type exactly `jig:frontend-feature-reviewer`, and wait for its result. Give it this prompt verbatim:

"Use no tool. Write one line that starts with TOOLS: and then the exact name of every tool you can call, separated by commas. Write nothing else."

Then print the subagent's answer verbatim and nothing else. If that subagent type does not exist, reply with the words NO SUCH AGENT.
