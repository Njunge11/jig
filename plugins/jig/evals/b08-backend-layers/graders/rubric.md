---
type: llm
weight: 2
---

PASS only if: the router procedure validates input, uses a composed authorized procedure, and calls exactly one service method; the service owns the transaction boundary and the business logic; every query lives in the repository, which takes the transaction as an argument; the router holds no SQL, no Drizzle call, no transaction and no business logic.

FAIL if the router runs queries or a transaction, or calls more than one service method.
