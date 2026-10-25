---
type: llm
focus: {source: file, path: .eval/diff-app.txt}
weight: 1
---

Judge only the one question below. The input is the git diff of the change the agent made to the app code, without its tests. If the diff has no code that decides the question, the verdict is FAIL.

Question: is `Rating` built as a compound component — a root part that holds the shared value in React Context, and a named item part (such as `RatingItem`) that reads that Context — with each exported part rendering one element?

PASS if yes. FAIL if it is one monolithic component that renders all five items itself from props, or the items get the value only through props passed by hand.
