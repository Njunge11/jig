/** Owns the product rows. */
import { and, desc, eq } from "drizzle-orm";
import { productsTable } from "@/db/schema";
import type { Db } from "@/db/types";

const productColumns = {
  id: productsTable.id,
  storeId: productsTable.storeId,
  title: productsTable.title,
  brand: productsTable.brand,
  size: productsTable.size,
  status: productsTable.status,
  priceCents: productsTable.priceCents,
  createdAt: productsTable.createdAt,
};

export type Product = typeof productsTable.$inferSelect;

export type ProductDetails = Pick<Product, "title" | "brand">;

export function makeProductsRepo(db: Db) {
  function list(storeId: string) {
    return db.select(productColumns).from(productsTable).where(eq(productsTable.storeId, storeId)).orderBy(desc(productsTable.createdAt));
  }

  async function byId(storeId: string, id: string) {
    const [row] = await db
      .select({ id: productsTable.id, title: productsTable.title, brand: productsTable.brand })
      .from(productsTable)
      .where(and(eq(productsTable.storeId, storeId), eq(productsTable.id, id)));
    return row ?? null;
  }

  async function update(storeId: string, id: string, details: ProductDetails) {
    const [row] = await db
      .update(productsTable)
      .set(details)
      .where(and(eq(productsTable.storeId, storeId), eq(productsTable.id, id)))
      .returning({ id: productsTable.id, title: productsTable.title, brand: productsTable.brand });
    return row ?? null;
  }

  async function remove(storeId: string, id: string) {
    const [row] = await db
      .delete(productsTable)
      .where(and(eq(productsTable.storeId, storeId), eq(productsTable.id, id)))
      .returning({ id: productsTable.id });
    return row ?? null;
  }

  return { list, byId, update, remove };
}

export type ProductsRepo = ReturnType<typeof makeProductsRepo>;
