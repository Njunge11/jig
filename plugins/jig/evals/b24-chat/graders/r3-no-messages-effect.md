---
type: llm
focus: {source: file, path: .eval/diff-app.txt}
weight: 1
---

Judge only the one question below. The input is the git diff of the change the agent made to the app code, without its tests.

Question: does any `useEffect` in the code read `messages`?

PASS if no `useEffect` reads `messages` (a reaction to a data part in `onData` is fine). FAIL if a `useEffect` reads or watches `messages`.
