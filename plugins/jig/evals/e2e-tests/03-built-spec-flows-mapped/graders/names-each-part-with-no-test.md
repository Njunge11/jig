---
type: llm
weight: 1
---

PASS if the reply says that each of these four parts of the spec has no test yet:
- an address that is already a member ("This person is already on the team.")
- a link that was used ("This invite was already used.")
- the Owner cancels a pending invite
- the Owner sends the invite again, and the old link is replaced

FAIL if one of the four is not named as without a test, or the reply says that the spec is covered.
