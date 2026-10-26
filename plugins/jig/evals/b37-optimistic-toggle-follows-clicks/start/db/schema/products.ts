import { boolean, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { storesTable } from "./stores";

export const productsTable = pgTable("products", {
  id: text("id").primaryKey(),
  storeId: text("store_id").notNull().references(() => storesTable.id),
  title: text("title").notNull(),
  size: text("size", { enum: ["small", "medium", "large"] }).notNull().default("medium"),
  featured: boolean("featured").notNull().default(false),
  status: text("status", { enum: ["active", "archived"] }).notNull().default("active"),
  priceCents: integer("price_cents").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
});
