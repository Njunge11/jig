---
type: llm
weight: 1
---

Judge only the one point below. Ignore every other quality of the answer. Do not fail the answer for a fault that this point does not name.

PASS if the fix removes the overview from the job's staged cards (it is no longer `staged`, or it becomes a separate kind of card that only reads the stage), so it no longer counts as the job's last card and draws no receipt and no offer, and the details card above it keeps both. FAIL if the fix is a special case that keeps the overview `staged`: for example `if (card === overviewCard) receipt = null`, a flag on the part, a check of whether this chat wrote the job description, or a change to `lastCardOfEachJob` that only skips the receipt, so either reported problem can remain.
