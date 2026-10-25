import { Suspense } from "react";
import { StorefrontProduct } from "@/features/storefront/ui/storefront-product";
import { StorefrontProductSkeleton } from "@/features/storefront/ui/storefront-product-skeleton";
import { HydrateClient, prefetch, trpc } from "@/lib/trpc/server";

export default async function Page({ params }: { params: Promise<{ productId: string }> }) {
  const { productId } = await params;
  prefetch(trpc.storefront.product.queryOptions({ productId }));
  return (
    <HydrateClient>
      <Suspense fallback={<StorefrontProductSkeleton />}>
        <StorefrontProduct productId={productId} />
      </Suspense>
    </HydrateClient>
  );
}
