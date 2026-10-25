---
type: llm
focus: {source: file, path: .eval/diff-app.txt}
weight: 1
---

Judge only the one question below. The input is the git diff of the change the agent made to the app code, without its tests. If the diff has no code that decides the question, the verdict is FAIL.

Question: Do only the `title` and `createdAt` columns render a sort control?

PASS if a sort control appears on the `title` and `createdAt` headers and on no other column. FAIL if another column has a sort control, or neither of the two has one.
