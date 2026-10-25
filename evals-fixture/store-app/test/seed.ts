import { productsTable, storesTable } from "@/db/schema";
import type { Db } from "@/db/types";

export const STORE_ID = "store-1";
export const OTHER_STORE_ID = "store-2";

export async function seedStores(tx: Db) {
  await tx.insert(storesTable).values([
    { id: STORE_ID, name: "Corner Shop" },
    { id: OTHER_STORE_ID, name: "Other Shop" },
  ]);
}

export async function seedProduct(tx: Db, row: Partial<typeof productsTable.$inferInsert> & { id: string; title: string }) {
  await tx.insert(productsTable).values({ storeId: STORE_ID, createdAt: new Date("2026-01-01T00:00:00Z"), ...row });
}
