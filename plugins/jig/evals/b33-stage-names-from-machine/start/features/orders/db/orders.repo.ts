/** Owns the order rows. */
import { and, count, desc, eq } from "drizzle-orm";
import { ordersTable } from "@/db/schema";
import type { Db } from "@/db/types";

const orderColumns = {
  id: ordersTable.id,
  number: ordersTable.number,
  status: ordersTable.status,
  createdAt: ordersTable.createdAt,
};

export const makeOrdersRepo = (db: Db) => ({
  list: (storeId: string, status: string) =>
    db
      .select(orderColumns)
      .from(ordersTable)
      .where(and(eq(ordersTable.storeId, storeId), eq(ordersTable.status, status)))
      .orderBy(desc(ordersTable.createdAt)),

  countsByStatus: (storeId: string) =>
    db
      .select({ status: ordersTable.status, count: count() })
      .from(ordersTable)
      .where(eq(ordersTable.storeId, storeId))
      .groupBy(ordersTable.status),
});

export type OrdersRepo = ReturnType<typeof makeOrdersRepo>;
