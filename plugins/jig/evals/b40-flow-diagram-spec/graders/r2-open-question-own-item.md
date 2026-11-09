---
type: llm
focus: {source: file, path: docs/flows/refund-request.json}
weight: 1
---

Judge only the one question below. The input is the data file of a flow diagram. If the file is missing, the verdict is FAIL.

Question: is the open decision about a partial refund of one item in a multi-item order its own "How it works" item on the summary step (the step where the customer sees the refund amount), and does the item say that the spec has not decided it?

PASS if that step has an `items` entry whose heading or text names the partial refund and states that it is undecided, open, or not yet in scope. FAIL if the question is only in the summary, is merged into an item about the refund amount or the shipping rule, or is stated as a decided fact.
