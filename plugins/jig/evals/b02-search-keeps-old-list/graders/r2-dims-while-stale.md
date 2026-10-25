---
type: llm
focus: {source: file, path: .eval/diff-app.txt}
weight: 1
---

Judge only the one question below. The input is the git diff of the change the agent made to the app code, without its tests. If the diff has no code that decides the question, the verdict is FAIL.

Question: Does the list show that it is stale while the new result loads?

PASS if the list is dimmed or marked busy (an opacity class, `aria-busy`, or the like) while the fresh nuqs value and the deferred value differ. FAIL if nothing marks the list as stale while the new result loads.
