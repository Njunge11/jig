---
type: llm
weight: 1
---

Judge only the one question below. Read only the code in the answer. If the answer has no code that decides the question, the verdict is FAIL.

Question: in the corrected test, does the assertion find the value through a Testing Library query on what the user sees (`getByText`, `findByText`, `getByRole`, `findByRole`, `getByLabelText`)?

PASS if yes. FAIL if the corrected test finds the value through `querySelector`, a CSS class, `container`, or a test id.
