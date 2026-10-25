"use client";
import { Button } from "@/components/ui/button";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="p-8">
      <p>Couldn&apos;t load this product</p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
