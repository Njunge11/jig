---
type: llm
weight: 1
---

Judge only the one point below. Ignore every other quality of the answer. Do not fail the answer for a fault that this point does not name.

PASS if it supports controlled and uncontrolled use with the exact names `value`, `onValueChange` and `defaultValue` (through `useControllableState` or an equal hook). FAIL if the names differ, or only one mode works.
