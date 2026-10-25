import { address_pending, address_saved, paid, shipped } from "../order.states";
import { orderSetup } from "./order.setup";

export const orderMachine = orderSetup.createMachine({
  id: "order",
  initial: "address_pending",
  context: {},
  states: { address_pending, address_saved, paid, shipped },
});
