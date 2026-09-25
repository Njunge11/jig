---
type: llm
weight: 1
---

Judge only the one point below. Ignore every other quality of the answer. Do not fail the answer for a fault that this point does not name.

PASS if the new machine still holds the state `details_complete` with a transition that takes a stored row forward into the role flow (for example `DETAILS_SAVED` or an `always` transition to `role_pending`), so that the rows already stored on `details_complete` move on without any change to the database. FAIL if `details_complete` is removed or left with no transition, or if the answer relies on a script, a migration or a manual database update to move the stored rows.
