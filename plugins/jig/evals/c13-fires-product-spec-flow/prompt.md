---
description: "a request to show a non-technical product spec as a click-through flow fires flow-diagram"
tags: [triggering, regression, flow-diagram]
max_turns: 4
timeout_seconds: 420
allowed_tools: [Read, Glob, Grep, Skill]
---

Our PM wrote this spec for self-serve refunds. Can you draw me the process step by step so I can click through it?

1. The customer opens the order in their account and taps "Request a refund". Orders older than 30 days do not show the button.
2. The customer picks a reason (damaged, wrong item, changed my mind, other) and can add a note.
3. The customer sees a summary with the refund amount. Shipping is refunded only for damaged or wrong item.
4. The customer confirms and gets a confirmation email.
5. An ops team member reviews the request within 2 business days. Requests under $50 are approved automatically.
6. On approval, the refund goes back to the original payment method. On rejection, the customer gets an email with the reason.
