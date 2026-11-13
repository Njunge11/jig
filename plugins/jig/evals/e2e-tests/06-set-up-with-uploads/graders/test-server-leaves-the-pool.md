---
type: llm
weight: 1
---

PASS if one of the listed changes limits the database connections of the test run's server, so that it and the three dev servers fit in the 15 connections of the pooler: for example the db client reads its pool size from an environment variable, and the test run sets a small number.
FAIL if no listed change is about the database connections.
