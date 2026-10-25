---
description: "stage tabs on a list page fire state-machines"
tags: [triggering, regression]
max_turns: 4
timeout_seconds: 420
allowed_tools: [Read, Glob, Grep, Skill]
---

The `orders.status` column stores the stage of each order: `needs_packing`, `shipped` or `cancelled`. The orders list page reads each row's status and the count of each stage from `trpc.ordersList.list`.

Write the orders page's tabs: To pack, Shipped and Cancelled, each with its count, with the active tab in the URL. Do not write any file. Reply with the code.
