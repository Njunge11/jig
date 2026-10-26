/** Owns the product rows. */
import { and, desc, eq } from "drizzle-orm";
import { productsTable } from "@/db/schema";
import type { Db } from "@/db/types";

const productColumns = {
  id: productsTable.id,
  storeId: productsTable.storeId,
  title: productsTable.title,
  size: productsTable.size,
  featured: productsTable.featured,
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

  setFeatured: async (storeId: string, id: string, featured: boolean) => {
    const [row] = await db
      .update(productsTable)
      .set({ featured })
      .where(and(eq(productsTable.storeId, storeId), eq(productsTable.id, id)))
      .returning({ id: productsTable.id, featured: productsTable.featured });
    return row ?? null;
  },
});

export type ProductsRepo = ReturnType<typeof makeProductsRepo>;
