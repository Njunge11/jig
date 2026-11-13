---
type: llm
weight: 1
---

Two checklists build the screens: one builds the Team page with the invite dialog, a later one builds the page that the emailed link opens.

PASS if each end-to-end test that goes through the page of the emailed link (the person sets a name and a password, a used link, the invite shows as "Accepted") is listed under the checklist that builds that page or under a later one, so each listed test can pass when its checklist is done.
FAIL if such a test is listed under the checklist that builds only the Team page and the invite dialog.
