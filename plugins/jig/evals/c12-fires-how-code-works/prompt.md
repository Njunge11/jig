---
description: "a 'how does this code work, walk me through it' request fires flow-diagram"
tags: [triggering, regression, flow-diagram]
max_turns: 4
timeout_seconds: 420
allowed_tools: [Read, Glob, Grep, Skill]
---

How does cancelling an order work here? Walk me through the path from the `orders.cancel` procedure, step by step.

```ts
// features/orders/api/orders.router.ts
cancel: orgProcedure
  .meta({ purpose: "cancel one order" })
  .input(z.object({ id: z.string() }))
  .mutation(({ ctx, input }) => makeCancelService(deps(ctx)).cancel(ctx.storeId, input.id)),
```

```ts
// features/orders/db/orders.repo.ts
function release(reservationId: string) {
  return db.update(stockReservationsTable).set({ state: "released" }).where(eq(stockReservationsTable.id, reservationId));
}
function remove(orderId: string) {
  return db.delete(ordersTable).where(eq(ordersTable.id, orderId));
}
```

```ts
// features/orders/api/cancel.service.ts
export function makeCancelService(deps: { repo: OrdersRepo }) {
  async function cancel(storeId: string, orderId: string) {
    const order = await deps.repo.byId(storeId, orderId);
    if (!order) throw new Error("order not found");
    const held = await deps.repo.heldReservations(orderId);
    for (const r of held) {
      await deps.repo.release(r.id);
    }
    await deps.repo.remove(orderId);
    const customer = await deps.repo.customerOf(order.customerId);
    email.send({ to: customer.email, template: "order-cancelled", data: { number: order.number } }).catch(() => {});
    return { id: orderId };
  }
  return { cancel };
}
```
