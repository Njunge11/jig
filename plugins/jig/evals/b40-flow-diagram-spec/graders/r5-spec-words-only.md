---
type: llm
focus: {source: file, path: docs/flows/refund-request.json}
weight: 1
---

Judge only the one question below. The input is the data file of a flow diagram built from a non-technical product spec. If the file is missing, the verdict is FAIL.

Question: do the cards stay in the words of the spec, with no technical part the spec did not name?

The spec names: the account, the order, the "Request a refund" button, a reason list, a note, a summary, the refund amount, shipping, a confirmation, emails, the back office, an ops team member, the original payment method, the customer's bank, and support. PASS if every `title`, `summary` and item `text` uses only such words, or marks an addition with "Inference:". FAIL if any card names a database table, a queue, a job, a service, an API, an endpoint, a function, a webhook, or a file that the spec does not name, without the "Inference:" mark.
