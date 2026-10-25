/** Owns the product rows. */
import { and, desc, eq } from "drizzle-orm";
import { productsTable } from "@/db/schema";
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

export type ProductStatus = Product["status"];

export function makeProductsRepo(db: Db) {
  function listActive(storeId: string) {
    return db
      .select(productColumns)
      .from(productsTable)
      .where(and(eq(productsTable.storeId, storeId), eq(productsTable.status, "active")))
      .orderBy(desc(productsTable.createdAt));
  }

  async function setStatus(storeId: string, id: string, status: ProductStatus) {
    const [row] = await db
      .update(productsTable)
      .set({ status })
      .where(and(eq(productsTable.storeId, storeId), eq(productsTable.id, id)))
      .returning({ id: productsTable.id });
    return row ?? null;
  }

  return { listActive, setStatus };
}

export type ProductsRepo = ReturnType<typeof makeProductsRepo>;
