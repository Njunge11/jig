import { setup } from "xstate";

export type StageEvent =
  | { type: "PAID" }
  | { type: "SHIPPED" }
  | { type: "CANCELLED" }
  | { type: "RETURNED" }
  | { type: "RESTORED" };

export const orderStatusSetup = setup({
  types: {
    events: {} as StageEvent,
    meta: {} as { label: string },
  },
});
