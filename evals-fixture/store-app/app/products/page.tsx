import { Suspense } from "react";
import { ProductsList } from "@/features/products/ui/products-list";
import { ProductsSkeleton } from "@/features/products/ui/products-skeleton";
import { HydrateClient, prefetch, trpc } from "@/lib/trpc/server";

export default async function Page() {
  prefetch(trpc.products.list.queryOptions({}));
  return (
    <HydrateClient>
      <Suspense fallback={<ProductsSkeleton />}>
        <ProductsList />
      </Suspense>
    </HydrateClient>
  );
}
