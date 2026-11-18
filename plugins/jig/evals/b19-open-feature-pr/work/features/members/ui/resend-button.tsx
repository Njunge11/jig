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
      meta: { failureTitle: "Couldn't resend the invitation" },
      onSuccess: () => toast.success("Invitation resent"),
    }),
  );
  return (
    <Button variant="outline" size="sm" disabled={resend.isPending} onClick={() => resend.mutate({ invitationId })}>
      {resend.isPending ? <Spinner /> : null} Resend
    </Button>
  );
}
