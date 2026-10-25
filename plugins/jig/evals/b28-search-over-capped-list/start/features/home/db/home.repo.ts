/** Owns the rows the store's home page reads. */
import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { customersTable, ordersTable, productsTable } from "@/db/schema";
import type { Db } from "@/db/types";

export function makeHomeRepo(db: Db) {
  function newestActiveProducts(storeId: string, limit: number) {
    return db
      .select({ id: productsTable.id, title: productsTable.title })
      .from(productsTable)
      .where(and(eq(productsTable.storeId, storeId), eq(productsTable.status, "active")))
      .orderBy(desc(productsTable.createdAt))
      .limit(limit);
  }

  // One statement: each product's newest orders, ranked per product, with the customer's name.
  async function newestOrders(productIds: string[], perProduct: number) {
    if (productIds.length === 0) return [];
    const ranked = db
      .select({
        id: ordersTable.id,
        productId: ordersTable.productId,
        number: ordersTable.number,
        customerName: customersTable.name,
        rank: sql<number>`row_number() over (partition by ${ordersTable.productId} order by ${ordersTable.createdAt} desc)`.as("rank"),
      })
      .from(ordersTable)
      .innerJoin(customersTable, eq(customersTable.id, ordersTable.customerId))
      .where(inArray(ordersTable.productId, productIds))
      .as("ranked");
    return db
      .select({ id: ranked.id, productId: ranked.productId, number: ranked.number, customerName: ranked.customerName })
      .from(ranked)
      .where(sql`${ranked.rank} <= ${perProduct}`);
  }

  return { newestActiveProducts, newestOrders };
}

export type HomeRepo = ReturnType<typeof makeHomeRepo>;
