---
type: llm
focus: {source: file, path: .eval/diff-app.txt}
weight: 1
---

Judge only the one question below. The input is the git diff of the change the agent made to the app code, without its tests. If the diff has no code that decides the question, the verdict is FAIL.

Question: Does the server page prefetch the counts and only the active tab's list?

PASS if the page parses the tab from the URL and prefetches `orders.counts` and `orders.list({ tab })` for that tab alone. FAIL if it prefetches every tab's list, awaits the lists, prefetches a fixed tab, or skips the counts.
