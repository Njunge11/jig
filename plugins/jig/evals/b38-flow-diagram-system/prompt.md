---
description: "flow-diagram: a system design becomes one linear data file in STE, with every second-look detail as its own item"
tags: [obedience, docs, regression, flow-diagram]
max_turns: 30
timeout_seconds: 900
allowed_tools: [Read, Glob, Grep, Skill, Write, Edit, Bash]
---

If a skill named `flow-diagram` is available to you, invoke it with the Skill tool before you start. If it is not available, work without it.

We agreed on this design for webhook ingestion. Show me the flow as a step-by-step diagram I can click through. Call the flow `webhook-ingest`.

Design:

1. Receive. `POST /api/webhooks/stripe` reads the raw body and the `Stripe-Signature` header.
2. Verify. The handler computes an HMAC with the signing secret from `STRIPE_WEBHOOK_SECRET` and compares it with the header. A mismatch returns 400.
3. Store. The handler inserts the raw payload into `webhook_events` with status `received`. A duplicate event id is ignored with `ON CONFLICT DO NOTHING`, and the handler still returns 200.
4. Enqueue. The handler pushes a job to a BullMQ queue on Redis. When Redis is down, the handler logs the error and still returns 200, so Stripe never retries.
5. Process. A worker loads the event, maps the Stripe status to an order status, and updates `orders.status`. The update has no version check, so two workers can write out of order.
6. Notify. The worker posts a message to Slack through the Slack Web API. A failed post is retried three times with backoff.
7. Purge. A nightly job deletes rows from `webhook_events` older than 24 hours. The delete is permanent: there is no archive table.
