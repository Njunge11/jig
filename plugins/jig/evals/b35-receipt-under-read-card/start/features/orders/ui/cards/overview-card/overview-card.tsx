import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PaymentReceipt } from "../../payment-receipt";
import type { OrderCardProps, OrderPart } from "../order-card-stage";

/** The card of a turn that asked for an order's overview: the order's details, then its receipt. */
export function OverviewCard({ part, stage }: OrderCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Order overview</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <p className="text-sm">Order {part.data.orderId}</p>
        {stage.receipt !== null ? <PaymentReceipt invoice={stage.receipt} /> : null}
      </CardContent>
    </Card>
  );
}

export const overviewCard = { Component: OverviewCard, staged: (part: OrderPart) => part.data.orderId };
