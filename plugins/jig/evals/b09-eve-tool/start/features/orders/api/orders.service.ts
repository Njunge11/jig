/** Reads one order of a store. */
import { trace } from "@/db/call-trace";
import type { OrdersRepo } from "../db/orders.repo";

export function makeOrdersService(deps: { repo: OrdersRepo }) {
  // The order, or null when the store has no such order.
  const getOrder = (orderId: string, storeId: string) =>
    trace("calling repo.byId to read the order", () => deps.repo.byId(orderId, storeId));

  return { getOrder };
}
