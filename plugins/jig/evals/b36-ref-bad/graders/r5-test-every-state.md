---
type: llm
weight: 1
---

Judge only the one question below. Read only the code in the answer. If the answer has no code that decides the question, the verdict is FAIL.

Question: is there a test that renders the job's acting card once for each state of `jobMachine` and asserts on screen whether "Write an interview plan?" shows in that state?

PASS if yes. FAIL if the test checks only some states, or asserts a value instead of the screen.
