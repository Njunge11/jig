/** Owns the reads of the products the public shop shows. */
import { and, eq } from "drizzle-orm";
import { productsTable } from "@/db/schema";
import type { Db } from "@/db/types";

export const makeStorefrontProductsRepo = (db: Db) => ({
  activeById: async (productId: string) => {
    const [product] = await db
      .select({
        id: productsTable.id,
        title: productsTable.title,
        priceCents: productsTable.priceCents,
        descriptionHtml: productsTable.descriptionHtml,
      })
      .from(productsTable)
      .where(and(eq(productsTable.id, productId), eq(productsTable.status, "active")));
    return product ?? null;
  },
});

export type StorefrontProductsRepo = ReturnType<typeof makeStorefrontProductsRepo>;
