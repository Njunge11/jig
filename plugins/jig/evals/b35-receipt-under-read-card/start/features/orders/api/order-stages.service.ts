/** Reads the stored stage of every order of the store, keyed by order id. */
import { trace } from "@/db/call-trace";
import type { OrdersRepo } from "../db/orders.repo";

export function makeOrderStagesService(deps: { repo: OrdersRepo }) {
  async function readStages(storeId: string) {
    const rows = await trace("calling repo.stages to read every order's stage", () => deps.repo.stages(storeId));
    return Object.fromEntries(rows.map((row) => [row.id, row.stage] as const));
  }

  return { readStages };
}
