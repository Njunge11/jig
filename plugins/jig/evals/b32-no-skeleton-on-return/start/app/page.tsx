import { Suspense } from "react";
import { OrdersList } from "@/features/orders/ui/orders-list";
import { OrdersSkeleton } from "@/features/orders/ui/orders-skeleton";
import { HydrateClient, prefetch, trpc } from "@/lib/trpc/server";

export default async function HomePage() {
  prefetch(trpc.orders.list.queryOptions({ tab: "active" }));
  return (
    <HydrateClient>
      <h1 className="text-xl font-semibold">Home</h1>
      <Suspense fallback={<OrdersSkeleton />}>
        <OrdersList tab="active" />
      </Suspense>
    </HydrateClient>
  );
}
