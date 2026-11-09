---
description: "flow-diagram: a non-technical product spec becomes one linear spec-mode data file in the spec's words, with every open question, gap, conflict and manual step as its own item"
tags: [obedience, docs, regression, flow-diagram]
max_turns: 30
timeout_seconds: 900
allowed_tools: [Read, Glob, Grep, Skill, Write, Edit, Bash]
---

If a skill named `flow-diagram` is available to you, invoke it with the Skill tool before you start. If it is not available, work without it.

Our PM wrote this spec for self-serve refunds. Turn it into a step-by-step diagram I can click through. Call the flow `refund-request`.

Refund request, PRD v0.3

Goal: a customer can ask for a refund on an order from the last 30 days without contacting support.

Flow:

1. The customer opens the order in their account and taps "Request a refund". Orders older than 30 days do not show the button.
2. The customer picks a reason from a list (damaged, wrong item, changed my mind, other) and can add a note. "Other" requires a note.
3. The customer sees a summary with the refund amount. Shipping is refunded only for damaged or wrong item. We have not decided whether a partial refund of one item in a multi-item order is in scope for v1.
4. The customer confirms. They see "We got your request" and get a confirmation email.
5. An ops team member reviews the request in the back office within 2 business days. Requests under $50 are approved automatically. Requests of $50 or more need a manual review. Note from the catalog team: a damaged claim on an order of $50 or more must have a photo attached, but the form in step 2 has no photo upload.
6. On approval, the refund goes back to the original payment method and the customer gets an email. How long the money takes depends on the customer's bank. On rejection, the customer gets an email with the reason and a link to contact support.
