---
type: llm
focus: {source: file, path: .eval/diff-app.txt}
weight: 1
---

Judge only the one question below. The input is the git diff of the change the agent made to the app code, without its tests. If the diff has no code that decides the question, the verdict is FAIL.

Question: Does the Featured checkbox stay enabled while its save is pending?

PASS if the checkbox's `disabled` prop is not bound to the mutation's pending state (`isPending`, `status === "pending"`, or a value derived from them), and no class or style dims it while pending. FAIL if the checkbox is disabled or dimmed while the save runs.
