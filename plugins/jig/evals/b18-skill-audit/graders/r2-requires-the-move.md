---
type: llm
weight: 1
---

Judge only the one question below. If the answer has nothing that decides the question, the verdict is FAIL.

Question: does the change the audit requires for the three rollback rules (the Never, the must, the one-at-a-time rule) move them into `SKILL.md`, or into a skill of their own that `release-engineer` also lists under `skills:`?

Judge only the change required for those three rules; fixes the audit proposes for other items do not decide this. PASS if that change moves them. FAIL if it leaves them in `references/` behind a pointer, however strong, such as "always read references/rollback.md".
