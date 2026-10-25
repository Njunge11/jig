---
type: llm
focus: {source: file, path: .eval/diff-app.txt}
weight: 1
---

Judge only the one question below. The input is the git diff of the change the agent made to the app code, without its tests. If the diff has no code that decides the question, the verdict is FAIL.

Question: in the new machine, can a row stored on `details_complete` before the change reach the pricing flow (`pricing_pending` or `pricing_complete`) through the event that its screen sends? Its screen draws the form that `details_complete`'s `meta` names in the new machine and sends that form's event: `DETAILS_SAVED` for `form: "details"`, `PRICING_SAVED` for `form: "pricing"`.

PASS if `details_complete` is still a state of the machine and handles that event with a transition into `pricing_pending` or `pricing_complete`. FAIL if `details_complete` is removed or renamed, if it does not handle that event, or if its only road forward is an `always` transition: `resolveState` does not take an `always` transition, so the row keeps showing its old form and the next event is dropped. FAIL too if the diff moves the stored rows with a script, a migration or a database update.
