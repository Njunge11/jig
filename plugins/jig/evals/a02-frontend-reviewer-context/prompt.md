---
description: "the frontend reviewer has every recipe in context"
tags: [delivery]
runs: 1
max_turns: 6
timeout_seconds: 420
allowed_tools: [Agent]
---

Spawn one subagent with the Agent tool, subagent_type exactly `jig:frontend-feature-reviewer`, and wait for its result. Give it this prompt verbatim:

"Use no tool. Answer only from the text that is already in your context. For each item give a word-for-word quote, or the words NOT IN CONTEXT. (1) The first item of the Verify list of the form-with-mutation recipe. (2) The verdict you record for a recipe whose catalog row does not match the diff."

Then print the subagent's answer verbatim and nothing else. If that subagent type does not exist, reply with the words NO SUCH AGENT.
