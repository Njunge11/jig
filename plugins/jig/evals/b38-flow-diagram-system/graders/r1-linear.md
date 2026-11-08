---
type: llm
focus: {source: file, path: docs/flows/webhook-ingest.json}
weight: 1
---

Judge only the one question below. The input is the data file of a flow diagram: a `steps` array, where each step has a `label` and, from the second step on, a `title`, a `summary` and `items`. If the file is missing or is not this shape, the verdict is FAIL.

Question: is the flow one linear path of 7 steps in the design's order (receive, verify, store, enqueue, process, notify, purge), with no branch?

PASS if `steps` has 7 entries in that order and no label, title or summary offers a fork ("or", "either", "if ... otherwise" as two paths). A condition stated inside an item ("A mismatch returns 400") is not a branch. FAIL if a step is missing, the order differs, or a label or title names two alternative paths.
