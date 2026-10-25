---
type: llm
focus: {source: file, path: .eval/diff-app.txt}
weight: 1
---

Judge only the one question below. The input is the git diff of the change the agent made to the app code, without its tests. If the diff has no code that decides the question, the verdict is FAIL.

Question: Is the nuqs state set without a `startTransition` option?

PASS if no `useQueryState`, `useQueryStates` or `.withOptions(...)` call in the code receives a `startTransition` option. A comment that explains why not to pass it does not count. FAIL if any of those calls receives a `startTransition` option.
