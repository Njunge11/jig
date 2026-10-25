import { setup } from "xstate";

export type OrderEvent = { type: "ADDRESS_SAVED" } | { type: "PAID"; invoice: number } | { type: "SHIPPED" };

export type OrderContext = { invoice?: number };

export const orderSetup = setup({
  types: {
    context: {} as OrderContext,
    events: {} as OrderEvent,
    meta: {} as { part?: "address-form" | "address-record"; offer?: "pay" | "gift-wrap"; receipt?: "shipped" },
    tags: {} as "paid",
  },
});
