import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OrderAddress } from "../../order-address";
import { OrderOffer } from "../../order-offer";
import { PaymentReceipt } from "../../payment-receipt";
import type { OrderCardProps, OrderPart } from "../order-card-stage";

/** The card of a turn that created or reopened an order: its form or record, its receipt, its offer. */
export function DetailsCard({ part, stage }: OrderCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Order details</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {stage.draws ? <OrderAddress draws={stage.draws} orderId={part.data.orderId} /> : null}
        {stage.receipt !== null ? <PaymentReceipt invoice={stage.receipt} /> : null}
        {stage.offer ? <OrderOffer offer={stage.offer} /> : null}
      </CardContent>
    </Card>
  );
}

export const detailsCard = { Component: DetailsCard, staged: (part: OrderPart) => part.data.orderId };
