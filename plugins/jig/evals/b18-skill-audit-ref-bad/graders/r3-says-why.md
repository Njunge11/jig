---
type: llm
weight: 1
---

Judge only the one question below. If the answer has nothing that decides the question, the verdict is FAIL.

Question: does the audit say why the rules in `references/rollback.md` can fail to reach the agent?

PASS if it says, in any words, that only `SKILL.md` is loaded or preloaded (the `skills:` list of `release-engineer` injects only `SKILL.md`), or that a file under `references/` is read only when the agent chooses to open it. Either part of that reason is enough. FAIL if it gives no reason, or a different reason only, such as length or style.
