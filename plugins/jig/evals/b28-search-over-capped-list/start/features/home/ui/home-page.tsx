"use client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "@/lib/trpc/react";
import { ProductsCard } from "./products-card";

export function HomePage() {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(trpc.home.overview.queryOptions());
  return <ProductsCard products={data.products} />;
}
