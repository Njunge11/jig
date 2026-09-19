---
type: llm
weight: 2
---

PASS only if the optimistic cache write follows this order: cancel the outgoing queries, snapshot the previous data, set the new data, roll back from the snapshot in `onError`, invalidate in `onSettled`; the button is disabled with a spinner while pending; the success toast names the action and its Undo calls the inverse mutation `jobs.unarchive`.

FAIL if invalidation runs in `onSuccess` only, if there is no rollback, if there is no `cancelQueries`, or if the undo re-implements the inverse in the client.
