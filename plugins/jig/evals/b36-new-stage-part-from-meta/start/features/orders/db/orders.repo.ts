/** Owns the order rows. */
import { eq } from "drizzle-orm";
import { ordersTable } from "@/db/schema";
import type { Db } from "@/db/types";

export const makeOrdersRepo = (db: Db) => ({
  stages: (storeId: string) =>
    db.select({ id: ordersTable.id, stage: ordersTable.stage }).from(ordersTable).where(eq(ordersTable.storeId, storeId)),
});

export type OrdersRepo = ReturnType<typeof makeOrdersRepo>;
