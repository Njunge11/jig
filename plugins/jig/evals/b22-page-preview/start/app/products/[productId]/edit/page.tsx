import { Suspense } from "react";
import { ProductEditForm } from "@/features/products/ui/product-edit-form";
import { ProductEditSkeleton } from "@/features/products/ui/product-edit-skeleton";
import { HydrateClient, prefetch, trpc } from "@/lib/trpc/server";

export default async function Page({ params }: { params: Promise<{ productId: string }> }) {
  const { productId } = await params;
  prefetch(trpc.products.byId.queryOptions({ productId }));
  return (
    <HydrateClient>
      <Suspense fallback={<ProductEditSkeleton />}>
        <ProductEditForm productId={productId} />
      </Suspense>
    </HydrateClient>
  );
}
