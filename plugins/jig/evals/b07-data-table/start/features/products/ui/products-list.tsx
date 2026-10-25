"use client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useQueryStates } from "nuqs";
import { useTRPC } from "@/lib/trpc/react";
import { productsListParams } from "./search-params";
import { ProductsTable } from "./products-table";
import { SearchInput } from "./search-input";

export function ProductsList() {
  const trpc = useTRPC();
  const [filters, setFilters] = useQueryStates(productsListParams);
  const { data } = useSuspenseQuery(trpc.products.list.queryOptions(filters));
  return (
    <div className="flex flex-col gap-4">
      <SearchInput value={filters.q} onCommit={(q) => setFilters({ q, page: 1 })} />
      <ProductsTable rows={data.rows} total={data.total} />
    </div>
  );
}
