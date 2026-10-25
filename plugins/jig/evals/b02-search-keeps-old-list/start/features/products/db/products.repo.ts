/** Owns the product rows. */
import { and, count, desc, eq, ilike } from "drizzle-orm";
import { productsTable } from "@/db/schema";
import type { Db } from "@/db/types";

export const PRODUCTS_PAGE_SIZE = 20;

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

export type ProductsListFilters = { q: string; page: number };

// LIKE treats % and _ as wildcards; a search for "50%" means the literal text.
const escapeLike = (text: string) => text.replace(/[\\%_]/g, (c) => `\\${c}`);

export function makeProductsRepo(db: Db) {
  async function list(storeId: string, { q, page }: ProductsListFilters) {
    const where = and(eq(productsTable.storeId, storeId), q ? ilike(productsTable.title, `%${escapeLike(q)}%`) : undefined);
    const [rows, [{ total }]] = await Promise.all([
      db
        .select(productColumns)
        .from(productsTable)
        .where(where)
        .orderBy(desc(productsTable.createdAt))
        .limit(PRODUCTS_PAGE_SIZE)
        .offset((page - 1) * PRODUCTS_PAGE_SIZE),
      db.select({ total: count() }).from(productsTable).where(where),
    ]);
    return { rows, total };
  }

  return { list };
}

export type ProductsRepo = ReturnType<typeof makeProductsRepo>;
