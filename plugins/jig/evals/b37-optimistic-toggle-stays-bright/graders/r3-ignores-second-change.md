---
type: llm
focus: {source: file, path: .eval/diff-app.txt}
weight: 1
---

Judge only the one question below. The input is the git diff of the change the agent made to the app code, without its tests. If the diff has no code that decides the question, the verdict is FAIL.

Question: Does the checkbox's change handler ignore a second change while the first save is pending?

PASS if the handler returns early, without calling `mutate`, while the save is pending. FAIL if a second click while pending calls `mutate` again, or if the only guard is a `disabled` prop.
