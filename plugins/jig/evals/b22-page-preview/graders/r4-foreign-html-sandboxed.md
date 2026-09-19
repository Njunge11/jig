---
type: llm
weight: 1
---

Judge only the one point below. Ignore every other quality of the answer. Do not fail the answer for a fault that this point does not name.

PASS if the pasted HTML renders only inside a sandboxed `srcDoc` iframe (or the answer sanitizes and states that foreign HTML must not go through `dangerouslySetInnerHTML` in the app tree). FAIL if pasted HTML goes through `dangerouslySetInnerHTML` with no sandbox.
