---
type: llm
focus: {source: file, path: .eval/diff-app.txt}
weight: 1
---

Judge only the one question below. The input is the git diff of the change the agent made to the app code, without its tests. If the diff has no code that decides the question, the verdict is FAIL.

Question: Does every click on the Featured checkbox send its save, with no click dropped?

PASS if each change calls the mutation, also while an earlier save is pending. FAIL if the handler returns early or skips `mutate` while a save is pending, or if the checkbox is disabled while pending.
