---
type: llm
focus: {source: file, path: .eval/diff-app.txt}
weight: 1
---

Judge only the one question below. The input is the git diff of the change the agent made to the app code, without its tests. If the diff has no code that decides the question, the verdict is FAIL.

Question: Is the Archive button disabled and showing a spinner or a pending label while the archive mutation is pending?

PASS if the button's `disabled` is bound to the archive mutation's `isPending` and it renders a spinner or a pending label while pending. FAIL if the button stays enabled, or shows no pending cue, while the mutation runs.
