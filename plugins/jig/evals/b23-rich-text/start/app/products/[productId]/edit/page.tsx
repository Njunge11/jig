import { Suspense } from "react";
import { ProductDescriptionForm } from "@/features/products/ui/product-description-form";
import { ProductDescriptionSkeleton } from "@/features/products/ui/product-description-skeleton";
import { HydrateClient, prefetch, trpc } from "@/lib/trpc/server";

export default async function Page({ params }: { params: Promise<{ productId: string }> }) {
  const { productId } = await params;
  prefetch(trpc.products.byId.queryOptions({ productId }));
  return (
    <HydrateClient>
      <Suspense fallback={<ProductDescriptionSkeleton />}>
        <ProductDescriptionForm productId={productId} />
      </Suspense>
    </HydrateClient>
  );
}
