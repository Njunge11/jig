---
type: llm
weight: 1
---

Judge only the one point below. Ignore every other quality of the answer. Do not fail the answer for a fault that this point does not name.

PASS if one shared module reads the stages from the machine's state nodes and exports them, and both `StageTabs` and `StageBadge` import their stage data from that module. The module may name the machine's tags (`"listed"`, `"jobTab"`, ...) to filter the state nodes, and may cast types; that is reading the machine, not a copy. FAIL if `StageTabs` or `StageBadge` keeps its own stage data, or if the shared module holds a literal list or map of stage values (`needs_review`, `shortlisted`, `not_a_match`) or stage names that it wrote itself instead of reading them from the state nodes.
