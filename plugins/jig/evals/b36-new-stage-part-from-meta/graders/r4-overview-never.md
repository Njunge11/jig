---
type: llm
focus: {source: file, path: .eval/diff-app.txt}
weight: 1
---

Judge only the one question below. The input is the git diff of the change the agent made to the app code, without its tests.

The overview card in the app is not `staged`: it receives no stage, so today it cannot draw an offer.

Question: does the diff add any code that lets the overview card draw the "Leave a review?" offer?

PASS if it adds none; a diff that leaves the overview card unchanged passes. An overview card that reads its own `reading` meta key, which names no offer, passes: that is the skill's rule for a read-only card. FAIL if it adds such code (a check of the order's data in the overview card, an offer in the overview's meta, the acting card's stage passed to it).
