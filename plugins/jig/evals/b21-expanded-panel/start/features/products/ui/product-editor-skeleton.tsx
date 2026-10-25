import { Skeleton } from "@/components/ui/skeleton";

export function ProductEditorSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-7 w-48" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Skeleton className="h-80 w-full" />
        <Skeleton className="h-80 w-full" />
      </div>
    </div>
  );
}
