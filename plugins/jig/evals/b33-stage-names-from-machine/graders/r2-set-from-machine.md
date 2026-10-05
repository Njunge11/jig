---
type: llm
weight: 1
---

Judge only the one point below. Ignore every other quality of the answer. Do not fail the answer for a fault that this point does not name.

PASS if the answer marks the stages each page lists in the machine itself (for example a tag such as `listed` on those state nodes, or a `meta` field), and every list of stages that a page uses is computed from the machine's state nodes. An export that keeps an old name, such as `JOB_STAGES`, passes when its value is computed from the state nodes. FAIL if any file outside the machine writes, as literals, its own list, array, tuple, union or key-to-status record of the stage values (`needs_review`, `shortlisted`, `not_a_match`) or of the tab keys (`longlisted`, ...) to decide which tabs show, on the candidates page or on the job page.
