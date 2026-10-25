---
type: llm
weight: 1
---

Judge only the one question below. Ignore every other fault the review names or misses.

Question: does the review name `count` as derived state — kept in `useState` and synced by a `useEffect` — and give the fix of computing it during render (`ids.length`)?

PASS if yes. FAIL if the review does not name this fault.
