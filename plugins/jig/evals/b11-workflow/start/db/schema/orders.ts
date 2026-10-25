import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { productsTable } from "./products";
import { storesTable } from "./stores";

export const customersTable = pgTable("customers", {
  id: text("id").primaryKey(),
  storeId: text("store_id").notNull().references(() => storesTable.id),
  name: text("name").notNull(),
  email: text("email").notNull(),
});

export const ordersTable = pgTable("orders", {
  id: text("id").primaryKey(),
  storeId: text("store_id").notNull().references(() => storesTable.id),
  customerId: text("customer_id").notNull().references(() => customersTable.id),
  productId: text("product_id").notNull().references(() => productsTable.id),
  number: text("number").notNull(),
  status: text("status").notNull(),
  totalCents: integer("total_cents").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
});

export const stockReservationsTable = pgTable("stock_reservations", {
  id: text("id").primaryKey(),
  orderId: text("order_id").notNull().references(() => ordersTable.id),
  productId: text("product_id").notNull().references(() => productsTable.id),
  state: text("state", { enum: ["held", "released", "consumed"] }).notNull(),
});

// The fraud score of an order, saved once.
export const orderScoresTable = pgTable("order_scores", {
  orderId: text("order_id").primaryKey().references(() => ordersTable.id),
  score: integer("score").notNull(),
});
