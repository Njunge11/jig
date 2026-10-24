---
type: llm
weight: 1
---

Judge only the one question below. Read only the code in the answer. If the answer has no code that decides the question, the verdict is FAIL.

Question: do both `StageTabs` and `StageBadge` import the stage data each one uses (the tabs' stages, the badge's names) from one shared module that computes them from the machine's state nodes?

PASS if yes. A type imported from another module (`ApplicationStatus`) is not stage data and does not count. FAIL if either component keeps its own stage data, or the two read from different places.
