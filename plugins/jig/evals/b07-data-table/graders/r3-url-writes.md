---
type: llm
focus: {source: file, path: .eval/diff-app.txt}
weight: 1
---

Judge only the one question below. The input is the git diff of the change the agent made to the app code, without its tests. If the diff has no code that decides the question, the verdict is FAIL.

Question: Do sort and page changes write the URL through the shared nuqs params, with a sort change also setting `page` to 1?

PASS if the sort control calls the shared params' setter with the new sort and `page: 1` in one call, and the pagination calls it with the new `page`. FAIL if sort or page lives in component state, or a sort change keeps the current page.
