---
type: llm
weight: 1
---

Judge only the one question below. If the answer has nothing that decides the question, the verdict is FAIL.

Question: does the reply return no review verdicts at all, that is no per-item pass or fail lines, no recipe applies or does-not-apply lines, and no file placement verdicts?

PASS if yes: it lists no verdict, because no checklist or branch was given. FAIL if it lists any such verdict, or describes a checklist or a diff as though one was reviewed.
