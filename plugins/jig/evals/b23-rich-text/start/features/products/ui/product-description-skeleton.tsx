import { Skeleton } from "@/components/ui/skeleton";

export function ProductDescriptionSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-7 w-48" />
      <Skeleton className="h-80 w-full" />
    </div>
  );
}
