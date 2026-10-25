---
type: llm
focus: {source: file, path: .eval/diff-app.txt}
weight: 1
---

Judge only the one question below. The input is the git diff of the change the agent made to the app code, without its tests. If the diff has no code that decides the question, the verdict is FAIL.

Question: can the overview card draw the receipt ("Payment received · invoice 1") or an offer, in any state?

PASS if no code path in the diff gives the overview card a receipt or an offer. FAIL if one does, including a special case that only blanks the receipt for the overview (`if (card === overviewCard)`, a flag on the part) while the overview still counts as the order's last card.
