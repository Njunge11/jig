---
type: llm
focus: {source: file, path: docs/flows/webhook-ingest.json}
weight: 1
---

Judge only the one question below. The input is the data file of a flow diagram. If the file is missing, the verdict is FAIL.

Question: is the permanent delete of old `webhook_events` rows its own "How it works" item on the purge step, and does that item say the delete is permanent, irreversible, or has no archive?

PASS if the purge step has an `items` entry whose heading or text names the delete and states that it is permanent or irreversible or that nothing is archived. FAIL if the delete is only in the summary, is merged into an item about something else, or is stated without the word that says it cannot be undone.
