import type { StateValueFrom } from "xstate";
import { cancelled, needsPacking, placed, shipped } from "../order-status.states";
import { orderStatusSetup } from "./order-status.setup";

export const orderStatusMachine = orderStatusSetup.createMachine({
  id: "orderStatus",
  initial: "new",
  states: { new: placed, needs_packing: needsPacking, shipped, cancelled },
});

/** The stage value an order's `status` column stores. */
export type OrderStatus = StateValueFrom<typeof orderStatusMachine>;
