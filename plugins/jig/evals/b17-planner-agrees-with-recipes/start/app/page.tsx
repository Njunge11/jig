import { Suspense } from "react";
import { HomePage } from "@/features/home/ui/home-page";
import { HomeSkeleton } from "@/features/home/ui/home-skeleton";
import { HydrateClient, prefetch, trpc } from "@/lib/trpc/server";

export default async function Page() {
  prefetch(trpc.home.overview.queryOptions());
  return (
    <HydrateClient>
      <Suspense fallback={<HomeSkeleton />}>
        <HomePage />
      </Suspense>
    </HydrateClient>
  );
}
