---
type: llm
focus: {source: file, path: .eval/diff-app.txt}
weight: 1
---

Judge only the one question below. The input is the git diff of the change the agent made to the app code, without its tests. If the diff has no code that decides the question, the verdict is FAIL.

Question: Does typing in the search box commit the term to the URL state only after a debounce?

PASS if the input keeps a local draft in React state and a debounced function (use-debounce or a timer) commits it to the nuqs state, so the query does not run per keystroke. FAIL if each keystroke sets the nuqs state that the query reads, including when only nuqs's `limitUrlUpdates` debounce delays the URL write.
