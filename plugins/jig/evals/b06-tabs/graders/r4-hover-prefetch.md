---
type: llm
focus: {source: file, path: .eval/diff-app.txt}
weight: 1
---

Judge only the one question below. The input is the git diff of the change the agent made to the app code, without its tests. If the diff has no code that decides the question, the verdict is FAIL.

Question: Does each tab trigger prefetch its tab's list on both hover and focus?

PASS if the `TabsTrigger`s have a hover handler (`onMouseEnter` or `onPointerEnter`) and an `onFocus` handler that call `prefetchQuery` with that tab's list input. FAIL if the hover or the focus handler is missing, or the client fetches every tab's list up front.
