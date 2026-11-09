---
type: llm
focus: {source: file, path: docs/flows/order-cancellation.json}
weight: 1
---

Judge only the one question below. The input is the data file of a flow diagram: a `start` card, an `end` card and a `steps` array, where each step from the second on has a `title`, a `summary`, `items`, an optional `example` and a `code` array. If the file is missing or is not this shape, the verdict is FAIL.

Question: does every step from the second on, and the `start` card, hold a `code` array with at least one source location in the form `<path>:<line>` (for example `features/orders/api/cancel.service.ts:14`), while no `title`, `summary`, item `heading` or item `text` anywhere in the file names a file or a path?

PASS if each of those cards has such a `code` entry and every card text names only what happens and the functions that do it (a function or method name such as `cancelOrder` or `ordersRepo.byId` is fine). FAIL if any step from the second on, or the `start` card, has no `code` entry, if an entry has no line number, or if any card text holds a file name (`cancel.service.ts`) or a path (`features/orders/api`).
