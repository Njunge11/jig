import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { storesTable } from "./stores";

export const invitationsTable = pgTable("invitations", {
  id: text("id").primaryKey(),
  storeId: text("store_id").notNull().references(() => storesTable.id),
  email: text("email").notNull(),
  token: text("token").notNull(),
  status: text("status", { enum: ["pending", "accepted"] }).notNull().default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
});
