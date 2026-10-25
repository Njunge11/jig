import { Skeleton } from "@/components/ui/skeleton";

export function StorefrontProductSkeleton() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4 px-4 py-8 md:px-8">
      <Skeleton className="h-9 w-2/3" />
      <Skeleton className="h-7 w-24" />
      <Skeleton className="h-40 w-full" />
    </div>
  );
}
