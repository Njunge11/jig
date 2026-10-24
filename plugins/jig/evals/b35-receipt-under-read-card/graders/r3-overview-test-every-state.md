---
type: llm
weight: 1
---

Judge only the one question below. Read only the code in the answer. If the answer has no code that decides the question, the verdict is FAIL.

Question: is there a test that renders the overview card once for each state of `jobMachine` and asserts on screen that it shows no receipt and no offer?

PASS if such a test exists. FAIL if the test checks only some states, or asserts a value instead of the screen.
