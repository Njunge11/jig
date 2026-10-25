import type { SearchParams } from "nuqs/server";
import { Suspense } from "react";
import { STAGE_STATUS } from "@/features/orders/ui/order-stages";
import { OrdersList } from "@/features/orders/ui/orders-list";
import { OrdersSkeleton } from "@/features/orders/ui/orders-skeleton";
import { loadOrdersListParams } from "@/features/orders/ui/search-params";
import { HydrateClient, prefetch, trpc } from "@/lib/trpc/server";

export default async function Page({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const { stage } = await loadOrdersListParams(searchParams);
  prefetch(trpc.orders.counts.queryOptions());
  prefetch(trpc.orders.list.queryOptions({ status: STAGE_STATUS[stage] }));
  return (
    <HydrateClient>
      <Suspense fallback={<OrdersSkeleton />}>
        <OrdersList />
      </Suspense>
    </HydrateClient>
  );
}
