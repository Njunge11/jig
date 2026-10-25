---
type: llm
focus: {source: file, path: .eval/diff-app.txt}
weight: 1
---

Judge only the one question below. The input is the git diff of the change the agent made to the app code, without its tests. If the diff has no code that decides the question, the verdict is FAIL.

Question: does `Rating` support both controlled use (`value` + `onValueChange`) and uncontrolled use (`defaultValue`), with exactly those prop names?

PASS if yes (through `useControllableState` or an equal hook). FAIL if the names differ, or only one mode works.
