/** What an order card draws of the order's stage: the part, the receipt's invoice and the offer. */
export type OrderCardStage = {
  draws: "address-form" | "address-record" | undefined;
  receipt: number | null;
  offer: "pay" | "gift-wrap" | null;
};

/** The part an order card is about. */
export type OrderPart = { data: { orderId: string } };

export type OrderCardProps = { part: OrderPart; stage: OrderCardStage };
