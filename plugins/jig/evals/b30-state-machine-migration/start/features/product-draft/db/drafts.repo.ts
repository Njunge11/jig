/** Owns the product draft rows. */
import { and, eq, sql } from "drizzle-orm";
import { productDraftsTable, type StoredDraftStage } from "@/db/schema";
import type { Db } from "@/db/types";

const draftColumns = {
  id: productDraftsTable.id,
  storeId: productDraftsTable.storeId,
  stage: productDraftsTable.stage,
};

export const makeDraftsRepo = (db: Db) => ({
  byId: async (draftId: string, storeId: string) => {
    const [draft] = await db
      .select(draftColumns)
      .from(productDraftsTable)
      .where(and(eq(productDraftsTable.id, draftId), eq(productDraftsTable.storeId, storeId)));
    return draft ?? null;
  },

  // Compare-and-set: the write lands only while the row still holds the stage value it was read with.
  saveStage: async (draftId: string, fromValue: string, stage: StoredDraftStage) => {
    const [draft] = await db
      .update(productDraftsTable)
      .set({ stage })
      .where(and(eq(productDraftsTable.id, draftId), sql`${productDraftsTable.stage}->>'value' = ${fromValue}`))
      .returning(draftColumns);
    return draft ?? null;
  },
});

export type DraftsRepo = ReturnType<typeof makeDraftsRepo>;
