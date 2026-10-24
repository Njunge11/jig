---
type: llm
weight: 1
---

Judge only the one question below. Read only the code in the answer. If the answer has no code that decides the question, the verdict is FAIL.

Question: is the card that draws the offer chosen only by the existing pick (`lastCardOfEachJob`, whose result reaches the card as the existing `isLastCard` prop)?

PASS if yes: passing `isLastCard` down is that same pick. FAIL if the answer adds a second rule that picks the card (another position check, an index, a card id stored in context).
