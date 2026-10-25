import { orderStatusSetup } from "./order-status/order-status.setup";

export const placed = orderStatusSetup.createStateConfig({
  meta: { label: "New" },
  on: { PAID: { target: "needs_packing" } },
});

export const needsPacking = orderStatusSetup.createStateConfig({
  meta: { label: "Needs packing" },
  on: { SHIPPED: { target: "shipped" }, CANCELLED: { target: "cancelled" } },
});

export const shipped = orderStatusSetup.createStateConfig({
  meta: { label: "Shipped" },
  on: { RETURNED: { target: "needs_packing" }, CANCELLED: { target: "cancelled" } },
});

export const cancelled = orderStatusSetup.createStateConfig({
  meta: { label: "Cancelled" },
  on: { RESTORED: { target: "needs_packing" } },
});
