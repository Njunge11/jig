---
type: llm
weight: 1
---

Judge only the one point below. Ignore every other quality of the answer. Do not fail the answer for a fault that this point does not name.

PASS if, in every stage, the overview card draws no job description receipt (`VersionReceipt`, `stage.receipt`), no offer (`stage.offer`) and no other part the stage names for the details card. FAIL if the overview card draws any of them in any stage, or if the answer leaves it to a later change. A part that the machine's `meta` names for the overview itself (for example a separate `meta.overview` key) is not a part of the details card and passes.
