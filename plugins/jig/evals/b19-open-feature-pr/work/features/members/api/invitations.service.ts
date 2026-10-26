/** Decides how a store's pending invitations are listed and resent. */
import { trace } from "@/db/call-trace";
import type { InvitationsRepo } from "../db/invitations.repo";

export type InvitationEmail = { send: (to: string, token: string) => Promise<void> };

export function makeInvitationsService(deps: { repo: InvitationsRepo; email: InvitationEmail; token: () => string }) {
  const pending = (storeId: string) =>
    trace("calling repo.pending to read the store's pending invitations", () => deps.repo.pending(storeId));

  async function resend(invitationId: string, storeId: string) {
    const row = await trace("calling repo.resend to replace the invitation's token", () =>
      deps.repo.resend(invitationId, storeId, deps.token()),
    );
    if (!row) return { status: "notFound" as const, message: "This invitation is no longer pending." };
    await trace("calling email.send to send the invitation again", () => deps.email.send(row.email, row.token));
    return { status: "resent" as const };
  }

  return { pending, resend };
}
