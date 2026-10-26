"use client";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useTRPC } from "@/lib/trpc/react";

export function ResendButton({ invitationId }: { invitationId: string }) {
  const trpc = useTRPC();
  const resend = useMutation(
    trpc.invitations.resend.mutationOptions({
      onSuccess: (result) =>
        result.status === "resent" ? toast.success("Invitation resent") : toast.error(result.message),
      onError: () => toast.error("Couldn't resend the invitation"),
    }),
  );
  return (
    <Button variant="outline" size="sm" disabled={resend.isPending} onClick={() => resend.mutate({ invitationId })}>
      {resend.isPending ? <Spinner /> : null} Resend
    </Button>
  );
}
