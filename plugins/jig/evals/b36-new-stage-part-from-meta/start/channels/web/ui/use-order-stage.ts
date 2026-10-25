"use client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "@/lib/trpc/react";

/** The stored stage of one order, from the one request that reads every order's stage. */
export function useOrderStage(orderId: string) {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(trpc.orders.stages.queryOptions());
  return data[orderId] ?? null;
}
