/** Owns the sent-notification markers. */
import { eq } from "drizzle-orm";
import { sentNotificationsTable } from "@/db/schema";
import type { Db } from "@/db/types";

export function makeNotificationsRepo(db: Db) {
  async function exists(key: string) {
    const [row] = await db.select({ key: sentNotificationsTable.key }).from(sentNotificationsTable).where(eq(sentNotificationsTable.key, key));
    return row !== undefined;
  }

  async function insert(key: string, sentAt: Date) {
    await db.insert(sentNotificationsTable).values({ key, sentAt }).onConflictDoNothing();
  }

  return { exists, insert };
}

export type NotificationsRepo = ReturnType<typeof makeNotificationsRepo>;
