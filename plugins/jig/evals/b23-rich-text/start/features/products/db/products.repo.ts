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

export const makeProductsRepo = (db: Db) => ({
  list: (storeId: string) =>
    db
      .select(productColumns)
      .from(productsTable)
      .where(eq(productsTable.storeId, storeId))
      .orderBy(desc(productsTable.createdAt)),

  byId: async (productId: string, storeId: string) => {
    const [product] = await db
      .select({ id: productsTable.id, title: productsTable.title, description: productsTable.description })
      .from(productsTable)
      .where(and(eq(productsTable.id, productId), eq(productsTable.storeId, storeId)));
    return product ?? null;
  },
});

export type ProductsRepo = ReturnType<typeof makeProductsRepo>;
