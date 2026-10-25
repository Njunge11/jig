/** The stages the orders page lists, with their names and the status each one shows. */
export const ORDER_STAGES = ["to_pack", "shipped"] as const;

export type OrderStageTab = (typeof ORDER_STAGES)[number];

export const STAGE_LABEL = { to_pack: "To pack", shipped: "Shipped" } as const;

export const STAGE_STATUS = { to_pack: "needs_packing", shipped: "shipped" } as const;
