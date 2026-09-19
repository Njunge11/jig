---
type: llm
weight: 1
---

Judge only the one point below. Ignore every other quality of the answer. Do not fail the answer for a fault that this point does not name.

PASS if the props extend the wrapped element (`React.ComponentProps<...>`), each prop type is exported as `<ComponentName>Props`, and `className` merges through `cn(...)` so the caller's classes win. FAIL if the caller's `className` is dropped.
