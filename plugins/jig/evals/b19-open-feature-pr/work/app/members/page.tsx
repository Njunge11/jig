import { Suspense } from "react";
import { InvitationsList } from "@/features/members/ui/invitations-list";
import { InvitationsSkeleton } from "@/features/members/ui/invitations-skeleton";
import { HydrateClient, prefetch, trpc } from "@/lib/trpc/server";

export default async function Page() {
  prefetch(trpc.invitations.pending.queryOptions());
  return (
    <HydrateClient>
      <Suspense fallback={<InvitationsSkeleton />}>
        <InvitationsList />
      </Suspense>
    </HydrateClient>
  );
}
