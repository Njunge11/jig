import { integer, jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { productsTable } from "./products";
import { storesTable } from "./stores";

/** The stored stage of an order: the value and context of its machine snapshot. */
export type StoredOrderStage = { value: string; context: { invoice?: number } };

/** The shopper's review of an order, once it is written. */
export type OrderReview = { rating: number; text: string };

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
  stage: jsonb("stage").$type<StoredOrderStage>().notNull(),
  review: jsonb("review").$type<OrderReview>(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
});

export const stockReservationsTable = pgTable("stock_reservations", {
  id: text("id").primaryKey(),
  orderId: text("order_id").notNull().references(() => ordersTable.id),
  productId: text("product_id").notNull().references(() => productsTable.id),
  state: text("state", { enum: ["held", "released", "consumed"] }).notNull(),
});
