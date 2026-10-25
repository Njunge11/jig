---
type: llm
focus: {source: file, path: .eval/diff-app.txt}
weight: 1
---

Judge only the one question below. The input is the git diff of the change the agent made to the app code, without its tests. If the diff has no code that decides the question, the verdict is FAIL.

Question: Are the tabs built from the kit's `Tabs`, `TabsList`, `TabsTrigger` and `TabsContent`?

PASS if the tab strip and the panels use those kit components. FAIL if the tabs are hand-made buttons or another custom control.
