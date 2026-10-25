import { assign } from "xstate";
import { orderSetup } from "./order/order.setup";

export const address_pending = orderSetup.createStateConfig({
  meta: { part: "address-form" },
  on: { ADDRESS_SAVED: { target: "address_saved" } },
});

export const address_saved = orderSetup.createStateConfig({
  meta: { part: "address-record", offer: "pay" },
  on: { PAID: { target: "paid", actions: assign({ invoice: ({ event }) => event.invoice }) } },
});

export const paid = orderSetup.createStateConfig({
  tags: ["paid"],
  meta: { part: "address-record", offer: "gift-wrap" },
  on: { SHIPPED: { target: "shipped" } },
});

export const shipped = orderSetup.createStateConfig({
  tags: ["paid"],
  meta: { receipt: "shipped" },
});
