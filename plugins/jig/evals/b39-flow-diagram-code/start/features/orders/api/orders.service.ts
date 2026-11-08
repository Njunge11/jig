/** Decides which orders each tab of the orders page lists, and how many each holds. */
import { trace } from "@/db/call-trace";
import type { OrdersRepo, OrderTab } from "../db/orders.repo";

export function makeOrdersService(deps: { repo: OrdersRepo }) {
  const list = (storeId: string, tab: OrderTab) =>
    trace(`calling repo.list to read the store's ${tab} orders`, () => deps.repo.list(storeId, tab));

  const counts = (storeId: string) =>
    trace("calling repo.counts to count the store's orders per tab", () => deps.repo.counts(storeId));

  return { list, counts };
}
