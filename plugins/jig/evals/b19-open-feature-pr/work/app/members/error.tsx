"use client";
import { Button } from "@/components/ui/button";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div>
      <p>Couldn&apos;t load the invitations</p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
