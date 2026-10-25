import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductsCount } from "@/features/products/ui/products-count";
import { ProductsList } from "@/features/products/ui/products-list";
import { ProductsSkeleton } from "@/features/products/ui/products-skeleton";
import { HydrateClient, prefetch, trpc } from "@/lib/trpc/server";

export default async function Page() {
  prefetch(trpc.products.list.queryOptions({}));
  return (
    <HydrateClient>
      <div className="flex flex-col gap-6 md:flex-row">
        <aside className="md:w-48">
          <Suspense fallback={<Skeleton className="h-5 w-32" />}>
            <ProductsCount />
          </Suspense>
        </aside>
        <main className="flex-1">
          <Suspense fallback={<ProductsSkeleton />}>
            <ProductsList />
          </Suspense>
        </main>
      </div>
    </HydrateClient>
  );
}
