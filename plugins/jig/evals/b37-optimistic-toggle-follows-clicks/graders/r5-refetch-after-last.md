---
type: llm
focus: {source: file, path: .eval/diff-app.txt}
weight: 1
---

Judge only the one question below. The input is the git diff of the change the agent made to the app code, without its tests. If the diff has no code that decides the question, the verdict is FAIL.

Question: Does the list refetch only after the last pending save of the checkbox settles?

PASS if `onSettled` invalidates or refetches the list only when `isMutating` for the save's mutation key is 1 (or another check that no other save of it is pending). FAIL if every save's `onSettled` or `onSuccess` invalidates the list, so a refetch can run between two saves.
