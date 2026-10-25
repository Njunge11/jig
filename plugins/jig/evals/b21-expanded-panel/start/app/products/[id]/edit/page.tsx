import { Suspense } from "react";
import { ProductEditor } from "@/features/products/ui/product-editor";
import { ProductEditorSkeleton } from "@/features/products/ui/product-editor-skeleton";
import { HydrateClient, prefetch, trpc } from "@/lib/trpc/server";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  prefetch(trpc.products.byId.queryOptions({ id }));
  return (
    <HydrateClient>
      <Suspense fallback={<ProductEditorSkeleton />}>
        <ProductEditor id={id} />
      </Suspense>
    </HydrateClient>
  );
}
