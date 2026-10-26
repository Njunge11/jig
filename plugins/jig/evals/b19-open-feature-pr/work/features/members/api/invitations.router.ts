/** The invitations resource's procedures. */
import { randomUUID } from "node:crypto";
import { z } from "zod";
import type { Db } from "@/db/types";
import { createTRPCRouter, orgProcedure } from "@/lib/trpc/init";
import { makeInvitationsRepo } from "../db/invitations.repo";
import { makeInvitationsService } from "./invitations.service";

// The fixture has no mail provider: the invitation email is logged.
const email = { send: async (to: string, token: string) => console.info("invitation email", { to, token }) };

const deps = (ctx: { db: Db }) => ({ repo: makeInvitationsRepo(ctx.db), email, token: randomUUID });

export const invitationsRouter = createTRPCRouter({
  pending: orgProcedure
    .meta({ purpose: "list the store's pending invitations" })
    .query(({ ctx }) => makeInvitationsService(deps(ctx)).pending(ctx.storeId)),

  resend: orgProcedure
    .meta({ purpose: "resend a pending invitation with a new token" })
    .input(z.object({ invitationId: z.string().min(1) }))
    .mutation(({ ctx, input }) => makeInvitationsService(deps(ctx)).resend(input.invitationId, ctx.storeId)),
});
