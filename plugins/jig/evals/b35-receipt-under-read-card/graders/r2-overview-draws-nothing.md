---
type: llm
weight: 1
---

Judge only the one question below. Read only the code in the answer. If the answer has no code that decides the question, the verdict is FAIL.

Question: can the overview card draw the receipt ("The job description is written · v1") or an offer, in any state?

PASS if no code path in the answer gives the overview card a receipt or an offer. FAIL if one does, including a special case that only blanks the receipt for the overview (`if (card === overviewCard)`, a flag on the part) while the overview still counts as the job's last card.
