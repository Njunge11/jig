import { Suspense } from "react";
import { ProductDraftPanel } from "@/features/product-draft/ui/product-draft-panel";
import { Skeleton } from "@/components/ui/skeleton";
import { HydrateClient, prefetch, trpc } from "@/lib/trpc/server";

export default async function Page({ params }: { params: Promise<{ draftId: string }> }) {
  const { draftId } = await params;
  prefetch(trpc.productDraft.read.queryOptions({ draftId }));
  return (
    <HydrateClient>
      <Suspense fallback={<Skeleton className="h-32 w-full" />}>
        <ProductDraftPanel draftId={draftId} />
      </Suspense>
    </HydrateClient>
  );
}
