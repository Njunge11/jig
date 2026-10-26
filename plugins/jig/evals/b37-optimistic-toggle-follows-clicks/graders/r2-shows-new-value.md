---
type: llm
focus: {source: file, path: .eval/diff-app.txt}
weight: 1
---

Judge only the one question below. The input is the git diff of the change the agent made to the app code, without its tests. If the diff has no code that decides the question, the verdict is FAIL.

Question: Does the checkbox show the new value at once, before the server answers?

PASS if the checked value comes from the mutation's `variables` while it is pending, or from an optimistic cache write in `onMutate`. FAIL if the checkbox shows the new value only after the server answers or the list refetches.
