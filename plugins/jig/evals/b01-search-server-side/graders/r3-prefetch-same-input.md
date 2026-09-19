---
type: llm
weight: 1
---

Judge only the one point below. Ignore every other quality of the answer. Do not fail the answer for a fault that this point does not name.

PASS if the server page parses the URL and prefetches `jobs.list` with the same input that the client queries. FAIL if the page still prefetches a fixed empty input.
