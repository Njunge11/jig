---
type: llm
weight: 1
---

Judge only the one question below. Read only the code in the answer.

The overview card in the prompt is not `staged`: it receives no stage, so today it cannot draw an offer.

Question: does the answer add any code that lets the overview card draw the "Write an interview plan?" offer?

PASS if it adds none; an answer that leaves the overview card unchanged passes. An overview card that reads its own `reading` meta key, which names no offer, passes: that is the skill's rule for a read-only card. FAIL if it adds such code (a check of the job's data in the overview card, an offer in the overview's meta, the acting card's stage passed to it).
