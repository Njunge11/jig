"use client";
import { useQueryErrorResetBoundary } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { describeFailure } from "@/lib/trpc/failure";

/** The one error page. Each `error.tsx` exports it, and `global-error.tsx` draws it. */
export function RouteError({ error, retry }: { error: unknown; retry: () => void }) {
  const { message, reference } = describeFailure(error);
  // A failed query fetches again only after this reset (TanStack Query, "Resetting Error Boundaries").
  const { reset } = useQueryErrorResetBoundary();
  function tryAgain() {
    reset();
    retry();
  }
  return (
    <div role="alert" data-slot="route-error" className="mx-auto flex max-w-md flex-col items-start gap-3 p-6">
      <h2 className="text-lg font-medium">This page did not load</h2>
      <p className="text-sm text-muted-foreground">{message}</p>
      {reference ? <p className="text-xs text-muted-foreground">Reference: {reference}</p> : null}
      <Button onClick={tryAgain}>Try again</Button>
    </div>
  );
}
