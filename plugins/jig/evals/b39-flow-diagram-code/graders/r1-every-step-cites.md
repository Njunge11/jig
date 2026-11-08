---
type: llm
focus: {source: file, path: docs/flows/order-cancellation.json}
weight: 1
---

Judge only the one question below. The input is the data file of a flow diagram: a `start` card, an `end` card and a `steps` array, where each step from the second on has a `title`, a `summary`, `items` and an optional `example`. If the file is missing or is not this shape, the verdict is FAIL.

Question: does every step from the second on, and the `start` card, cite a source location in the form `<path>:<line>` (for example `features/orders/api/cancel.service.ts:14`) somewhere in its title, summary, items or example?

PASS if each of those has at least one such citation. FAIL if any step from the second on, or the `start` summary, has none. A path with no line number is not a citation.
