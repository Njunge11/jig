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

export type NewProduct = Pick<typeof productsTable.$inferInsert, "id" | "storeId" | "title" | "size" | "createdAt">;

export function makeProductsRepo(db: Db) {
  function list(storeId: string) {
    return db.select(productColumns).from(productsTable).where(eq(productsTable.storeId, storeId)).orderBy(desc(productsTable.createdAt));
  }

  async function findByTitle(storeId: string, title: string) {
    const [row] = await db
      .select({ id: productsTable.id })
      .from(productsTable)
      .where(and(eq(productsTable.storeId, storeId), eq(productsTable.title, title)));
    return row ?? null;
  }

  async function insert(product: NewProduct) {
    const [row] = await db.insert(productsTable).values(product).returning(productColumns);
    return row;
  }

  return { list, findByTitle, insert };
}

export type ProductsRepo = ReturnType<typeof makeProductsRepo>;
