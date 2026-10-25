---
type: llm
focus: {source: file, path: .eval/diff-app.txt}
weight: 1
---

Judge only the one question below. The input is the git diff of the change the agent made to the app code, without its tests. If the diff has no code that decides the question, the verdict is FAIL.

Question: does the diff remove the hand-written stage copies that `features/orders/ui/order-stages.ts` held before the change (`ORDER_STAGES`, `STAGE_LABEL` and `STAGE_STATUS`)?

PASS if the diff deletes that file, or deletes those three constants from it, or changes each of them to a value read from the machine's state nodes. FAIL if any of the three is left with its literal stage names or stage values: the diff does not touch the file, or changes only some of the three.
