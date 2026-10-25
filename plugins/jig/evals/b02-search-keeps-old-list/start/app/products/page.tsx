import type { SearchParams } from "nuqs/server";
import { Suspense } from "react";
import { loadProductsListParams } from "@/features/products/ui/search-params";
import { ProductsList } from "@/features/products/ui/products-list";
import { ProductsSkeleton } from "@/features/products/ui/products-skeleton";
import { HydrateClient, prefetch, trpc } from "@/lib/trpc/server";

export default async function Page({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const filters = await loadProductsListParams(searchParams);
  prefetch(trpc.products.list.queryOptions(filters));
  return (
    <HydrateClient>
      <Suspense fallback={<ProductsSkeleton />}>
        <ProductsList />
      </Suspense>
    </HydrateClient>
  );
}
