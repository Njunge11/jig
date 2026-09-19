---
type: llm
weight: 1
---

Judge only the one point below. Ignore every other quality of the answer. Do not fail the answer for a fault that this point does not name.

PASS if no code filters the fetched jobs or candidates in the browser by the term. FAIL if a `.filter(` / `useMemo` over `data.jobs` does the search.
