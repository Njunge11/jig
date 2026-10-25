---
type: llm
focus: {source: file, path: .eval/diff-app.txt}
weight: 1
---

Judge only the one question below. The input is the git diff of the change the agent made to the app code, without its tests. If the diff has no code that decides the question, the verdict is FAIL.

Question: Does each tab panel have its own `Suspense` boundary with a skeleton fallback?

PASS if each panel's list sits inside its own `<Suspense>` (inside its `TabsContent`) with a skeleton fallback. FAIL if one boundary wraps all the panels, or a panel has no boundary.
