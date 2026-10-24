---
type: llm
weight: 1
---

Judge only the one question below. Read only the code in the answer. If the answer has no code that decides the question, the verdict is FAIL.

Question: does a state's `meta` name the interview plan offer, and does the code show that offer only because the current state's meta names it?

PASS if yes. FAIL if the offer shows from a check of data beside the stored snapshot (`interview_plan === null`, a `has…` flag, a `useState`).
