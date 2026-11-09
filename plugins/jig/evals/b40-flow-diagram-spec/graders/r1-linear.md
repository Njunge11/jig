---
type: llm
focus: {source: file, path: docs/flows/refund-request.json}
weight: 1
---

Judge only the one question below. The input is the data file of a flow diagram: a `steps` array, where each step has a `label` and, from the second step on, a `title`, a `summary` and `items`. If the file is missing or is not this shape, the verdict is FAIL.

Question: is the flow one linear path of 5 to 7 steps in the spec's order (open the order, pick a reason, see the summary, confirm, review, decision or outcome), with no branch?

A branch is two steps or two labels that stand as alternate paths, or a label that names two paths ("Refund or reject" as a box). One decision step whose title, summary or items name its two outcomes ("approved or rejected", an item per outcome) is not a branch. The rejection path told inside an item is not a branch.

PASS if `steps` follows the spec's order and has no branch as defined above. FAIL if a step is missing, the order differs, a label names two alternative paths, or two steps stand as alternate paths.
