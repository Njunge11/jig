import type { UIMessage } from "ai";

/** The data parts the assistant streams: one per tool result that shows an order. */
type AppDataParts = {
  "order-details": { orderId: string };
  "order-overview": { orderId: string };
};

export type AppMessage = UIMessage<unknown, AppDataParts>;
export type AppMessagePart = AppMessage["parts"][number];
export type CardType = "text" | `data-${keyof AppDataParts}`;
export type PartOf<T extends CardType> = Extract<AppMessagePart, { type: T }>;
