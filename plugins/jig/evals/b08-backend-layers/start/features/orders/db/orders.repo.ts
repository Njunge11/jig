/** Owns the order rows. */
import { and, desc, eq, ne, sql } from "drizzle-orm";
import { ordersTable } from "@/db/schema";
import type { Db } from "@/db/types";

export const orderTabs = ["active", "archived"] as const;

export type OrderTab = (typeof orderTabs)[number];

const orderColumns = {
  id: ordersTable.id,
  number: ordersTable.number,
  status: ordersTable.status,
  totalCents: ordersTable.totalCents,
  createdAt: ordersTable.createdAt,
};

// An archived order has the status "archived"; every other status is active.
const inTab = (tab: OrderTab) => (tab === "archived" ? eq(ordersTable.status, "archived") : ne(ordersTable.status, "archived"));

const countWhere = (tab: OrderTab) => sql<number>`count(*) filter (where ${inTab(tab)})`.mapWith(Number);

export function makeOrdersRepo(db: Db) {
  function list(storeId: string, tab: OrderTab) {
    return db
      .select(orderColumns)
      .from(ordersTable)
      .where(and(eq(ordersTable.storeId, storeId), inTab(tab)))
      .orderBy(desc(ordersTable.createdAt));
  }

  async function counts(storeId: string) {
    const [row] = await db
      .select({
        active: countWhere("active"),
        archived: countWhere("archived"),
      })
      .from(ordersTable)
      .where(eq(ordersTable.storeId, storeId));
    return row;
  }

  return { list, counts };
}

export type OrdersRepo = ReturnType<typeof makeOrdersRepo>;
