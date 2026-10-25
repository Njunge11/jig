import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

// One row per notification sent, keyed by the sender's own key.
export const sentNotificationsTable = pgTable("sent_notifications", {
  key: text("key").primaryKey(),
  sentAt: timestamp("sent_at", { withTimezone: true }).notNull(),
});
