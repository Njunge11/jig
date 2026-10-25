---
type: llm
focus: {source: file, path: .eval/diff-app.txt}
weight: 1
---

Judge only the one question below. The input is the git diff of the change the agent made to the app code, without its tests. If the diff has no code that decides the question, the verdict is FAIL.

Question: does the `prefetch` helper start `prefetchQuery` without awaiting it (`void queryClient.prefetchQuery(...)`), so the page streams?

PASS if yes. FAIL if the helper awaits the prefetch, or there is no prefetch helper.
