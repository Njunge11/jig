"use client";
import { orderMachine } from "@/features/orders/machine/order/order.machine";
import type { AppMessagePart } from "./app-message";
import type { Card } from "./cards/card";
import { useOrderStage } from "./use-order-stage";

type StagedPartProps = {
  card: Extract<Card<AppMessagePart>, { staged: unknown }>;
  part: AppMessagePart;
  isLastCard: boolean;
};

export function StagedPart({ card, part, isLastCard }: StagedPartProps) {
  const stored = useOrderStage(card.staged(part));
  if (!stored) return null;
  const snapshot = orderMachine.resolveState(stored);
  const meta = snapshot.getMeta()[`order.${snapshot.value}`];
  const stage = {
    draws: meta?.part,
    receipt: isLastCard && snapshot.hasTag("paid") ? (snapshot.context.invoice ?? null) : null,
    offer: isLastCard ? (meta?.offer ?? null) : null,
  };
  return <card.Component part={part} stage={stage} />;
}
