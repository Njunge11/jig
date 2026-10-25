/** The product draft resource's procedures. */
import { z } from "zod";
import type { Db } from "@/db/types";
import { createTRPCRouter, orgProcedure } from "@/lib/trpc/init";
import { makeDraftsRepo } from "../db/drafts.repo";
import { makeReadDraftService } from "./read-draft.service";
import { makeSendDraftEventService } from "./send-draft-event.service";

const deps = (ctx: { db: Db }) => ({ repo: makeDraftsRepo(ctx.db) });

const draftEvent = z.object({ type: z.enum(["SUBMIT", "APPROVE", "BACK"]) });

export const productDraftRouter = createTRPCRouter({
  read: orgProcedure
    .meta({ purpose: "read the draft's stage" })
    .input(z.object({ draftId: z.string() }))
    .query(({ ctx, input }) => makeReadDraftService(deps(ctx)).readDraft(input.draftId, ctx.storeId)),

  send: orgProcedure
    .meta({ purpose: "move the draft by the seller's event" })
    .input(z.object({ draftId: z.string(), event: draftEvent }))
    .mutation(({ ctx, input }) =>
      makeSendDraftEventService(deps(ctx)).sendDraftEvent(input.draftId, ctx.storeId, input.event),
    ),
});
