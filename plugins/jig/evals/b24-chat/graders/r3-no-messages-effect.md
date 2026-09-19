---
type: llm
weight: 1
---

Judge only the one point below. Ignore every other quality of the answer. Do not fail the answer for a fault that this point does not name.

PASS if no `useEffect` reads `messages`; a reaction to a data part runs in `onData` (or the stream reducer). FAIL if a `useEffect` watches `messages`.
