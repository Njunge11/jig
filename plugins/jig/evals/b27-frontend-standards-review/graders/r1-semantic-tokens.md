---
type: llm
weight: 1
---

Judge only the one question below. Ignore every other fault the review names or misses.

Question: does the review name raw palette colors (`bg-white`, `text-gray-900`, `border-gray-300`) as a fault and give semantic tokens (such as `bg-background`, `text-foreground`, `border-border` / `border-input`) as the fix?

PASS if yes. FAIL if the review does not name this fault.
