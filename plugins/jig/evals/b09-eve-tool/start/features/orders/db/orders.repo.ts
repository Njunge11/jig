/** Owns the order rows. */
import { and, eq } from "drizzle-orm";
import { ordersTable } from "@/db/schema";
import type { Db } from "@/db/types";

const orderColumns = {
  id: ordersTable.id,
  number: ordersTable.number,
  status: ordersTable.status,
  totalCents: ordersTable.totalCents,
  createdAt: ordersTable.createdAt,
};

export function makeOrdersRepo(db: Db) {
  async function byId(orderId: string, storeId: string) {
    const [row] = await db
      .select(orderColumns)
      .from(ordersTable)
      .where(and(eq(ordersTable.id, orderId), eq(ordersTable.storeId, storeId)));
    return row ?? null;
  }

  return { byId };
}

export type OrdersRepo = ReturnType<typeof makeOrdersRepo>;
