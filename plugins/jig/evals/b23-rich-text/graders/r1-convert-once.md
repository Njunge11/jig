---
type: llm
weight: 1
---

Judge only the one point below. Ignore every other quality of the answer. Do not fail the answer for a fault that this point does not name.

PASS if the stream renders in a read-only view while it arrives, and `$convertFromMarkdownString` runs once at completion. FAIL if the accumulated markdown is converted into the editor on each stream tick.
