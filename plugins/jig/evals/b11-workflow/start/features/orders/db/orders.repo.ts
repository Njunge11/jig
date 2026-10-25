/** Owns the order rows and their fraud scores. */
import { eq } from "drizzle-orm";
import { orderScoresTable, ordersTable, storesTable } from "@/db/schema";
import type { Db } from "@/db/types";

export function makeOrdersRepo(db: Db) {
  async function score(orderId: string) {
    const [row] = await db.select({ score: orderScoresTable.score }).from(orderScoresTable).where(eq(orderScoresTable.orderId, orderId));
    return row?.score ?? null;
  }

  async function saveScore(orderId: string, value: number) {
    await db.insert(orderScoresTable).values({ orderId, score: value }).onConflictDoNothing();
  }

  async function ownerEmail(orderId: string) {
    const [row] = await db
      .select({ email: storesTable.ownerEmail })
      .from(ordersTable)
      .innerJoin(storesTable, eq(storesTable.id, ordersTable.storeId))
      .where(eq(ordersTable.id, orderId));
    return row?.email ?? null;
  }

  return { score, saveScore, ownerEmail };
}

export type OrdersRepo = ReturnType<typeof makeOrdersRepo>;
