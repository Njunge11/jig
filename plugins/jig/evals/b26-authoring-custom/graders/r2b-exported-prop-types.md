---
type: llm
focus: {source: file, path: .eval/diff-app.txt}
weight: 1
---

Judge only the one question below. The input is the git diff of the change the agent made to the app code, without its tests. If the diff has no code that decides the question, the verdict is FAIL.

Question: is each part's props type built on the wrapped element's props (`React.ComponentProps<...>` or `ComponentPropsWithoutRef<...>`) and exported under the name `<ComponentName>Props` (for example `RatingProps`, `RatingItemProps`)?

PASS if yes for every part. FAIL if a part's props type is not exported, is named differently, or does not extend the element's props.
