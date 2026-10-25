import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

/** The draft's details step; its Submit button hands the draft on to review. */
export function DetailsForm({ onSubmit, pending }: { onSubmit: () => void; pending: boolean }) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">Fill in the product&apos;s details.</p>
      <Button onClick={onSubmit} disabled={pending} className="self-start">
        {pending ? <Spinner /> : null} Submit
      </Button>
    </div>
  );
}
