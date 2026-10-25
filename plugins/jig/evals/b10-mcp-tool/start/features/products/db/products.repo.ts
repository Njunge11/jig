/** Owns the product rows. */
import { and, desc, eq } from "drizzle-orm";
import { ordersTable, productsTable } from "@/db/schema";
import type { Db } from "@/db/types";

const productColumns = {
  id: productsTable.id,
  storeId: productsTable.storeId,
  title: productsTable.title,
  size: productsTable.size,
  status: productsTable.status,
  priceCents: productsTable.priceCents,
  createdAt: productsTable.createdAt,
};

export type Product = typeof productsTable.$inferSelect;

const inStore = (id: string, storeId: string) => and(eq(productsTable.id, id), eq(productsTable.storeId, storeId));

export function makeProductsRepo(db: Db) {
  function list(storeId: string) {
    return db
      .select(productColumns)
      .from(productsTable)
      .where(eq(productsTable.storeId, storeId))
      .orderBy(desc(productsTable.createdAt));
  }

  async function exists(id: string, storeId: string) {
    const [row] = await db.select({ id: productsTable.id }).from(productsTable).where(inStore(id, storeId));
    return row !== undefined;
  }

  async function hasOrders(id: string) {
    const [row] = await db.select({ id: ordersTable.id }).from(ordersTable).where(eq(ordersTable.productId, id)).limit(1);
    return row !== undefined;
  }

  async function remove(id: string, storeId: string) {
    await db.delete(productsTable).where(inStore(id, storeId));
  }

  return { list, exists, hasOrders, remove };
}

export type ProductsRepo = ReturnType<typeof makeProductsRepo>;
