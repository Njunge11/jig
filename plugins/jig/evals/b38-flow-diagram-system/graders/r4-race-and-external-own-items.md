---
type: llm
focus: {source: file, path: docs/flows/webhook-ingest.json}
weight: 1
---

Judge only the one question below. The input is the data file of a flow diagram. If the file is missing, the verdict is FAIL.

Question: does the process step have its own item for the missing version check (two workers can write `orders.status` out of order), and does the notify step have its own item for the call to the external Slack Web API?

PASS if both items exist, each on its step, each with a heading that names the detail. FAIL if either detail is missing, is only in a summary, or shares an item with another detail.
