import type { ReactNode } from "react";
import type { OrderCardStage } from "@/features/orders/ui/cards/order-card-stage";

/** One part type's card. A `staged` card draws an order's stage; `staged` names the order its part is about. */
export type Card<P> =
  | { staged?: undefined; Component: (props: { part: P }) => ReactNode }
  | { staged: (part: P) => string; Component: (props: { part: P; stage: OrderCardStage }) => ReactNode };
