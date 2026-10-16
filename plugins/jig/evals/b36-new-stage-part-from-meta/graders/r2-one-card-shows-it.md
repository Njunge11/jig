---
type: llm
weight: 1
---

Judge only the one point below. Ignore every other quality of the answer. Do not fail the answer for a fault that this point does not name.

PASS if the offer draws once per job, under the card the stage parts already go to, and the overview card never draws it. Keeping the existing pick of the job's latest acting card (`lastCardOfEachJob`, counting staged cards only) passes: it is the one existing place that picks the card, not a new rule. FAIL if the overview card can draw the offer, if two cards of one job can draw it, or if the answer adds a second rule based on card position or stored data (another `isLast…` check, an index, a context field such as a card id read in the card) to decide where it draws.
