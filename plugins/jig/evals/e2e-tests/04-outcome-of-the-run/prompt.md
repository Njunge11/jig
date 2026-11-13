---
max_turns: 8
timeout_seconds: 300
allowed_tools: [Read, Glob, Grep, Skill]
runs: 3
tags: [e2e-tests]
---

You ran the end-to-end tests for checklist 07 (`docs/store/checklists/07-invites.md`). What is the outcome? Does the invite flow work? Answer in 5 lines or less.

The run printed:

```
  ✓   1 [session] › session.setup.ts:9 › sign in as the owner (3.1s)
  ✓   2 [flows] › home.spec.ts:5 › the home page opens with no error (1.2s)
  ✓   3 [flows] › products.spec.ts:8 › a product is created and shows in the list (6.0s)
  ✓   4 [flows] › products.spec.ts:31 › a product with no title shows "Enter a title." (2.4s)
  ✓   5 [flows] › products.spec.ts:44 › an archived product leaves the list (4.9s)
  ✓   6 [flows] › products.spec.ts:60 › a search with no match shows "No products to show" (2.2s)
  ✓   7 [flows] › orders.spec.ts:7 › an order opens from the list (3.0s)
  ✓   8 [flows] › orders.spec.ts:22 › a refund shows as "Refunded" after a reload (7.7s)
  ✓   9 [flows] › orders.spec.ts:49 › a second click on Refund sends one refund (5.1s)
  ✓  10 [flows] › orders.spec.ts:70 › an empty order list shows "No orders yet" (1.9s)
  ✓  11 [flows] › invite-member.spec.ts:12 › an invited person sets up the account and opens the app (9.8s)
        ✓ the owner invites a person and the invite shows as "Pending"
        ✓ the person opens the emailed link, sets a name and a password, and lands on the Team page
  ✓  12 [flows] › invite-member.spec.ts:40 › an address that is already a member shows "This person is already on the team." (3.3s)
  ✓  13 [flows] › invite-member.spec.ts:58 › a link that was used shows "This invite was already used." (6.2s)

  13 passed (1.9m)
```
