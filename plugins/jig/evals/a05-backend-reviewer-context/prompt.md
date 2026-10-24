---
description: "the backend reviewer holds the test and entry-point rules, and no machine rule until it loads one"
tags: [delivery]
runs: 1
max_turns: 6
timeout_seconds: 420
allowed_tools: [Agent]
---

Spawn one subagent with the Agent tool, subagent_type exactly `jig:backend-feature-reviewer`, and wait for its result. Give it this prompt verbatim:

"Use no tool. Answer only from the text that is already in your context. For each item give a word-for-word quote, or the words NOT IN CONTEXT. (1) Item 4 of the backend-tests Review checklist. (2) The heading of the section that describes the statement counter. (3) The default retry count of a workflow step. (4) Item 2 of the Shared items of the state-machines Review checklist."

Then print the subagent's answer verbatim and nothing else. If that subagent type does not exist, reply with the words NO SUCH AGENT.
