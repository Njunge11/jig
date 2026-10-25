"use client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "@/lib/trpc/react";

/** The sidebar counter: how many active products the store has. */
export function ProductsCount() {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(trpc.products.list.queryOptions({}));
  return <p className="text-sm text-muted-foreground">{data.length} active products</p>;
}
