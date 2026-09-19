---
type: llm
weight: 1
---

Judge only the one point below. Ignore every other quality of the answer. Do not fail the answer for a fault that this point does not name.

PASS if one `makeQueryClient` factory sets a non-zero `staleTime` and a `shouldDehydrateQuery` that also includes pending queries. FAIL if pending queries are not dehydrated.
