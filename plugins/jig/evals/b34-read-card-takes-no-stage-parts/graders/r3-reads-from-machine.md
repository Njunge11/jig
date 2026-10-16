---
type: llm
weight: 1
---

Judge only the one point below. Ignore every other quality of the answer. Do not fail the answer for a fault that this point does not name.

PASS if everything the overview card shows that depends on the job's stage is read from the machine: `getMeta`, `hasTag`, `matches`, or a reader the machine module exports. A card that shows nothing stage-dependent passes. FAIL if what the overview shows depends on its position in the transcript, or on a check of `snapshot.context` fields or other stored data made in the card or the transcript instead of in the machine.
