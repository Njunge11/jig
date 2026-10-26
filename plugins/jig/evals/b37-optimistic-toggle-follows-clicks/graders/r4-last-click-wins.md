---
type: llm
focus: {source: file, path: .eval/diff-app.txt}
weight: 1
---

Judge only the one question below. The input is the git diff of the change the agent made to the app code, without its tests. If the diff has no code that decides the question, the verdict is FAIL.

Question: Is the last click's value always the last value the server writes?

PASS if the saves of one checkbox share a mutation `scope` id, so TanStack runs them one after another in click order, or if the code queues the clicks and sends the final value after the save in flight ends. FAIL if two saves of one checkbox can run at the same time with nothing that orders them.
