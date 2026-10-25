/** Decides which orders a stage of the orders page lists, and how many each stage holds. */
import { trace } from "@/db/call-trace";
import type { OrdersRepo } from "../db/orders.repo";

export function makeOrdersService(deps: { repo: OrdersRepo }) {
  const list = (storeId: string, status: string) =>
    trace("calling repo.list to read the stage's orders", () => deps.repo.list(storeId, status));

  async function counts(storeId: string) {
    const rows = await trace("calling repo.countsByStatus to count the store's orders per stage", () =>
      deps.repo.countsByStatus(storeId),
    );
    return Object.fromEntries(rows.map((row) => [row.status, row.count])) as Record<string, number>;
  }

  return { list, counts };
}
