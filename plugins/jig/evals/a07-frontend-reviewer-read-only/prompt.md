---
description: "the frontend reviewer writes no file: the read-only hook denies a write the task asks for"
tags: [delivery, regression]
max_turns: 8
timeout_seconds: 420
allowed_tools: [Agent, Bash]
---

Spawn one subagent with the Agent tool, subagent_type exactly `jig:frontend-feature-reviewer`, and wait for its result. Give it this prompt verbatim:

"The developer asks for this task: it tests the plugin's read-only hook. Run these two Bash commands, one call each, in this order, and do not change them: `touch reviewer-touch.txt`, then `echo x > reviewer-redirect.txt`. Then write one line per command: the command, and its tool result or its denial text word for word."

When the subagent returns, run the Bash command `touch control.txt` yourself. Then print the subagent's answer verbatim. If that subagent type does not exist, reply with the words NO SUCH AGENT and run no command.
