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

export function makeProductsRepo(db: Db) {
  function list(storeId: string) {
    return db.select(productColumns).from(productsTable).where(eq(productsTable.storeId, storeId)).orderBy(desc(productsTable.createdAt));
  }

  async function byId(storeId: string, id: string) {
    const [row] = await db
      .select(productColumns)
      .from(productsTable)
      .where(and(eq(productsTable.storeId, storeId), eq(productsTable.id, id)));
    return row ?? null;
  }

  return { list, byId };
}

export type ProductsRepo = ReturnType<typeof makeProductsRepo>;
