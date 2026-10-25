"use client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "@/lib/trpc/react";
import { ProductsTable } from "./products-table";

export function ProductsList() {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(trpc.products.list.queryOptions({}));
  return <ProductsTable rows={data} />;
}
