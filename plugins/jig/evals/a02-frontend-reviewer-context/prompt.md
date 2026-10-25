---
description: "the frontend reviewer holds its core rubric, and no recipe until it loads one"
tags: [delivery, regression]
max_turns: 6
timeout_seconds: 420
allowed_tools: [Agent]
---

Spawn one subagent with the Agent tool, subagent_type exactly `jig:frontend-feature-reviewer`, and wait for its result. Give it this prompt verbatim:

"Use no tool. Answer only from the text that is already in your context. For each item give a word-for-word quote, or the words NOT IN CONTEXT. (1) Rule 3 of the frontend-standards Rules list. (2) Item 1 of the frontend-tests Review checklist. (3) The sentence of your instructions that says what you record for each row of the frontend-standards catalog. (4) The first item of the Verify list of the search-and-filters recipe."

Then print the subagent's answer verbatim and nothing else. If that subagent type does not exist, reply with the words NO SUCH AGENT.
