---
type: llm
focus: {source: file, path: .eval/diff-app.txt}
weight: 1
---

Judge only the one question below. The input is the git diff of the change the agent made to the app code, without its tests. If the diff has no code that decides the question, the verdict is FAIL.

Question: does every `Link` that `AppSidebar` renders for its items have `prefetch` set to true?

PASS if the sidebar's `Link` has `prefetch` or `prefetch={true}`, or a value that is true for every item (such as `prefetch={item.prefetch}` where every item has `prefetch: true`). FAIL if the sidebar's `Link` has no `prefetch` prop, or its value is `false`, `null` or `"auto"`, or it is false for any item.
