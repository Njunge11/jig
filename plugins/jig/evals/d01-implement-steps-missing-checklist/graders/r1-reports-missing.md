---
type: llm
weight: 1
---

Judge only the one question below. If the answer has nothing that decides the question, the verdict is FAIL.

Question: does the reply say that the checklist `docs/growth/checklists/99-no-such-step.md` was not found, or that the tracker has no row for it?

PASS if it says the file does not exist or could not be found, or that no tracker row names it. FAIL if it describes the checklist's contents or steps as though the file was read.
