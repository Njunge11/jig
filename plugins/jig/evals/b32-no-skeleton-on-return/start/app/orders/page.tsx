import { Suspense } from "react";
import { OrdersList } from "@/features/orders/ui/orders-list";
import { OrdersSkeleton } from "@/features/orders/ui/orders-skeleton";
import { HydrateClient, prefetch, trpc } from "@/lib/trpc/server";

export default async function Page() {
  prefetch(trpc.orders.list.queryOptions({ tab: "active" }));
  return (
    <HydrateClient>
      <Suspense fallback={<OrdersSkeleton />}>
        <OrdersList tab="active" />
      </Suspense>
    </HydrateClient>
  );
}
