import { customersTable, ordersTable, productsTable, storesTable } from "@/db/schema";
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

/** Seeds one order, with the customer and the product it needs. */
export async function seedOrder(tx: Db, row: { id: string; number: string; status: string; createdAt?: Date; storeId?: string }) {
  const storeId = row.storeId ?? STORE_ID;
  await tx.insert(customersTable).values({ id: `c-${row.id}`, storeId, name: "Ann", email: "ann@example.com" });
  await seedProduct(tx, { id: `p-${row.id}`, title: `Item for ${row.number}`, storeId });
  await tx.insert(ordersTable).values({
    customerId: `c-${row.id}`,
    productId: `p-${row.id}`,
    totalCents: 1200,
    createdAt: new Date("2026-01-01T00:00:00Z"),
    ...row,
    storeId,
  });
}
