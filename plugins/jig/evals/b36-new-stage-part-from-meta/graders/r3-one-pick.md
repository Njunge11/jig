---
type: llm
focus: {source: file, path: .eval/diff-app.txt}
weight: 1
---

Judge only the one question below. The input is the git diff of the change the agent made to the app code, without its tests.

The app already has one pick: `lastCardOfEachOrder` in `channels/web/ui/last-card-of-each-order.ts` picks the last staged card of each order, and `channels/web/ui/staged-part.tsx` gives a card its offer only when that pick chose it (`offer: isLastCard ? (meta?.offer ?? null) : null`). A diff that leaves this code unchanged, and lets the new offer reach the card through the stage's `offer`, uses the existing pick.

Question: is the card that draws the review offer chosen only by the existing pick?

PASS if yes: a diff that does not touch the pick passes, and so does a diff that only passes `isLastCard` on. FAIL if the diff adds a second rule that picks the card (another position check, an index, a card id stored in context).
