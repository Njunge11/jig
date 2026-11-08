/** Decides how an order is cancelled: its stock is released, the row is removed, and the customer is told. */
import { email } from "@/lib/email";
import type { OrdersRepo } from "../db/orders.repo";

export function makeCancelService(deps: { repo: OrdersRepo }) {
  async function cancel(storeId: string, orderId: string) {
    const order = await deps.repo.byId(storeId, orderId);
    if (!order) throw new Error("order not found");

    const held = await deps.repo.heldReservations(orderId);
    for (const r of held) {
      // eslint-disable-next-line no-await-in-loop
      await deps.repo.release(r.id);
    }

    await deps.repo.remove(orderId);

    // TODO: move the customer lookup into the repo's byId join
    const customer = await deps.repo.customerOf(order.customerId);
    email.send({ to: customer.email, template: "order-cancelled", data: { number: order.number } }).catch(() => {});

    return { id: orderId };
  }

  return { cancel };
}
