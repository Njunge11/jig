/** Owns the product draft rows. */
import { and, eq } from "drizzle-orm";
import { productDraftsTable } from "@/db/schema";
import type { Db } from "@/db/types";
import type { DraftDetails } from "../api/draft-fields";

export type Draft = typeof productDraftsTable.$inferSelect;

const draftColumns = {
  id: productDraftsTable.id,
  storeId: productDraftsTable.storeId,
  title: productDraftsTable.title,
  size: productDraftsTable.size,
  priceCents: productDraftsTable.priceCents,
  status: productDraftsTable.status,
  createdAt: productDraftsTable.createdAt,
  updatedAt: productDraftsTable.updatedAt,
};

export const makeDraftsRepo = (db: Db) => ({
  insert: async (row: { id: string; storeId: string; now: Date }) => {
    const [draft] = await db
      .insert(productDraftsTable)
      .values({ id: row.id, storeId: row.storeId, createdAt: row.now, updatedAt: row.now })
      .returning(draftColumns);
    return draft;
  },

  byId: async (draftId: string, storeId: string) => {
    const [draft] = await db
      .select(draftColumns)
      .from(productDraftsTable)
      .where(and(eq(productDraftsTable.id, draftId), eq(productDraftsTable.storeId, storeId)));
    return draft ?? null;
  },

  updateDetails: async (draftId: string, storeId: string, details: Partial<DraftDetails>, now: Date) => {
    const [draft] = await db
      .update(productDraftsTable)
      .set({ ...details, updatedAt: now })
      .where(and(eq(productDraftsTable.id, draftId), eq(productDraftsTable.storeId, storeId)))
      .returning(draftColumns);
    return draft ?? null;
  },

  markPublished: async (draftId: string, now: Date) => {
    const [draft] = await db
      .update(productDraftsTable)
      .set({ status: "published", updatedAt: now })
      .where(eq(productDraftsTable.id, draftId))
      .returning(draftColumns);
    return draft ?? null;
  },
});

export type DraftsRepo = ReturnType<typeof makeDraftsRepo>;
