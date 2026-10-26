"use client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "@/lib/trpc/react";
import { ResendButton } from "./resend-button";

export function InvitationsList() {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(trpc.invitations.pending.queryOptions());
  if (data.length === 0) return <p className="text-muted-foreground">No pending invitations</p>;
  return (
    <ul className="flex flex-col gap-2">
      {data.map((invitation) => (
        <li key={invitation.id} className="flex items-center justify-between gap-4">
          <span>{invitation.email}</span>
          <ResendButton invitationId={invitation.id} />
        </li>
      ))}
    </ul>
  );
}
