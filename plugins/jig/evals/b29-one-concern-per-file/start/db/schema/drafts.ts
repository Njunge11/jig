import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { storesTable } from "./stores";

export const productDraftsTable = pgTable("product_drafts", {
  id: text("id").primaryKey(),
  storeId: text("store_id").notNull().references(() => storesTable.id),
  title: text("title"),
  size: text("size", { enum: ["small", "medium", "large"] }),
  priceCents: integer("price_cents"),
  status: text("status", { enum: ["draft", "published"] }).notNull().default("draft"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
});
