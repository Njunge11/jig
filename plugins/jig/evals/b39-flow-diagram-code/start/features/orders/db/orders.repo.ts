/** Owns the order rows. */
import { and, desc, eq, ne, sql } from "drizzle-orm";
import { customersTable, ordersTable, stockReservationsTable } from "@/db/schema";
import type { Db } from "@/db/types";

export const orderTabs = ["active", "archived"] as const;

export type OrderTab = (typeof orderTabs)[number];

const orderColumns = {
  id: ordersTable.id,
  number: ordersTable.number,
  status: ordersTable.status,
  totalCents: ordersTable.totalCents,
  createdAt: ordersTable.createdAt,
  customerId: ordersTable.customerId,
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

  async function byId(storeId: string, id: string) {
    const [row] = await db
      .select(orderColumns)
      .from(ordersTable)
      .where(and(eq(ordersTable.storeId, storeId), eq(ordersTable.id, id)));
    return row ?? null;
  }

  function heldReservations(orderId: string) {
    return db
      .select({ id: stockReservationsTable.id })
      .from(stockReservationsTable)
      .where(and(eq(stockReservationsTable.orderId, orderId), eq(stockReservationsTable.state, "held")));
  }

  async function customerOf(customerId: string) {
    const [row] = await db.select({ email: customersTable.email }).from(customersTable).where(eq(customersTable.id, customerId));
    return row;
  }

  function release(reservationId: string) {
    return db.update(stockReservationsTable).set({ state: "released" }).where(eq(stockReservationsTable.id, reservationId));
  }

  // Removes the row. There is no soft delete: the schema has no "cancelled" status.
  function remove(orderId: string) {
    return db.delete(ordersTable).where(eq(ordersTable.id, orderId));
  }

  return { list, counts, byId, heldReservations, customerOf, release, remove };
}

export type OrdersRepo = ReturnType<typeof makeOrdersRepo>;
