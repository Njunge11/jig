import { jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { storesTable } from "./stores";

/** The stored stage of a draft: the value of its machine snapshot. */
export type StoredDraftStage = { value: string };

export const productDraftsTable = pgTable("product_drafts", {
  id: text("id").primaryKey(),
  storeId: text("store_id").notNull().references(() => storesTable.id),
  stage: jsonb("stage").$type<StoredDraftStage>().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
});
