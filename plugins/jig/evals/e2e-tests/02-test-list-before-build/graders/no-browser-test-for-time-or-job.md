---
type: llm
weight: 1
---

PASS if no line of the end-to-end list tests the nightly clean-up job, and no line tests the expiry of a code after 10 minutes. A note that these two belong to backend tests is a PASS.
FAIL if a line of the end-to-end list tests the nightly job or the 10-minute expiry, also when the line uses a moved clock, a changed database row or a wait.
