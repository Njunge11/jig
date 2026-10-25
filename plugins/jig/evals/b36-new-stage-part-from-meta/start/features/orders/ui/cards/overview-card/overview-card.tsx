import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { OrderPart } from "../order-card-stage";

/** The card of a turn that asked for an order's overview: it only reads the order and shows its details. */
export function OverviewCard({ part }: { part: OrderPart }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Order overview</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <p className="text-sm">Order {part.data.orderId}</p>
      </CardContent>
    </Card>
  );
}

export const overviewCard = { Component: OverviewCard };
