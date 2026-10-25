---
type: llm
focus: {source: file, path: .eval/diff-app.txt}
weight: 1
---

Judge only the one question below. The input is the git diff of the change the agent made to the app code, without its tests. If the diff has no code that decides the question, the verdict is FAIL.

Question: do both `StageTabs` and `StageBadge` import the stage data each one uses (the tabs' stages, the badge's names) from one shared module that computes them from the machine's state nodes?

A function the shared module exports that reads the machine's state nodes (a label lookup such as `stageLabel(status)`) is stage data from that module.

PASS if yes. A type imported from another module (`OrderStatus`) is not stage data and does not count. FAIL if either component keeps its own stage data, or the two read from different places.
