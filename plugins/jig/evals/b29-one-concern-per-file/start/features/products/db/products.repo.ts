/** Owns the product rows. */
import { desc, eq } from "drizzle-orm";
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

export type NewProduct = typeof productsTable.$inferInsert;

export const makeProductsRepo = (db: Db) => ({
  list: (storeId: string) =>
    db
      .select(productColumns)
      .from(productsTable)
      .where(eq(productsTable.storeId, storeId))
      .orderBy(desc(productsTable.createdAt)),

  insert: async (row: NewProduct) => {
    const [product] = await db.insert(productsTable).values(row).returning({ id: productsTable.id });
    return product;
  },
});

export type ProductsRepo = ReturnType<typeof makeProductsRepo>;
