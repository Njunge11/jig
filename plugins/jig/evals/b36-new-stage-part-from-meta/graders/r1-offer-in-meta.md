---
type: llm
weight: 1
---

Judge only the one point below. Ignore every other quality of the answer. Do not fail the answer for a fault that this point does not name.

PASS if the machine gets the stage: a state (or a region of `published`) whose `meta` names the interview plan offer, with an event that moves to a state without it once the plan is written, and the card shows the offer only because the stage's meta names it. FAIL if the offer shows from a data check outside the machine (`interview_plan === null`, a `hasPlan` flag, a `useState`), or the answer adds no state for it.
