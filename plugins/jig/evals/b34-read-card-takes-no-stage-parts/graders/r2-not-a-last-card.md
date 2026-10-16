---
type: llm
weight: 1
---

Judge only the one point below. Ignore every other quality of the answer. Do not fail the answer for a fault that this point does not name.

PASS if an overview below a job's details card leaves the details card's receipt and offer where they were: the overview is not one of the parts `lastCardOfEachJob` counts (it is not `staged`, or the answer gives it a separate kind of card that only reads the stage). FAIL if the overview is `staged`, or counts as the job's last card in any other way, so that an overview takes the receipt or the offer from the details card above it or makes them disappear.
