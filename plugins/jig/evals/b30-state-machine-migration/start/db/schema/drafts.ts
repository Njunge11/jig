import { jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import type { DraftContext } from "@/features/product-draft/machine/product-draft/product-draft.setup";
import { storesTable } from "./stores";

/** The stored stage of a draft: the value and the context of its machine snapshot. */
export type StoredDraftStage = { value: string; context: DraftContext };

export const productDraftsTable = pgTable("product_drafts", {
  id: text("id").primaryKey(),
  storeId: text("store_id").notNull().references(() => storesTable.id),
  stage: jsonb("stage").$type<StoredDraftStage>().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
});
