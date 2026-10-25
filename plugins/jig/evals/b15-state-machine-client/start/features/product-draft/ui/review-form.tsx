import { Button } from "@/components/ui/button";

/** The draft's review step: the seller approves it, or goes back to the details. */
export function ReviewForm({ onApprove, onBack, pending }: { onApprove: () => void; onBack: () => void; pending: boolean }) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">Check the product before it goes live.</p>
      <div className="flex gap-2">
        <Button onClick={onApprove} disabled={pending}>
          Approve
        </Button>
        <Button variant="outline" onClick={onBack} disabled={pending}>
          Back
        </Button>
      </div>
    </div>
  );
}
