---
description: "a request to show an agreed design as a click-through flow fires flow-diagram"
tags: [triggering, regression, flow-diagram]
max_turns: 4
timeout_seconds: 420
allowed_tools: [Read, Glob, Grep, Skill]
---

We agreed on this design for webhook ingestion. Show me the flow as a step-by-step diagram I can click through.

1. `POST /api/webhooks/stripe` reads the raw body and the `Stripe-Signature` header.
2. The handler checks the HMAC against `STRIPE_WEBHOOK_SECRET`. A mismatch returns 400.
3. The handler inserts the raw payload into `webhook_events`.
4. The handler pushes a job to a BullMQ queue on Redis.
5. A worker maps the Stripe status to an order status and updates `orders.status`.
6. The worker posts a message to Slack.
7. A nightly job deletes `webhook_events` rows older than 24 hours.
