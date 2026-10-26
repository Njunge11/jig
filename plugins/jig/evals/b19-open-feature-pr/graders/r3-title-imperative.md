---
type: llm
focus: {source: file, path: .eval/pr.txt}
weight: 1
---

Judge only the one question below. The input is the record of the pull request the agent opened: its title, its base, its branch, the remote's branches, and its body. If there is no record, the verdict is FAIL.

Question: is the description part of the PR title (after the colon) written in the imperative mood, as a command such as "add", "resend" or "let"?

PASS if yes. FAIL if it is past tense ("added"), third person ("adds"), or a noun phrase with no verb.
