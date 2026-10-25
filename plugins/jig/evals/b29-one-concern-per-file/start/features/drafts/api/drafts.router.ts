/** The drafts resource's procedures. */
import { z } from "zod";
import type { Db } from "@/db/types";
import { createTRPCRouter, orgProcedure } from "@/lib/trpc/init";
import { makeDraftsRepo } from "../db/drafts.repo";
import { makeDraftsService } from "./drafts.service";

const deps = (ctx: { db: Db }) => ({
  repo: makeDraftsRepo(ctx.db),
  now: () => new Date(),
  uuid: () => crypto.randomUUID(),
});

const draftId = z.object({ draftId: z.string() });

export const draftsRouter = createTRPCRouter({
  create: orgProcedure
    .meta({ purpose: "start a product draft" })
    .mutation(({ ctx }) => makeDraftsService(deps(ctx)).createDraft(ctx.storeId)),

  read: orgProcedure
    .meta({ purpose: "read a product draft" })
    .input(draftId)
    .query(({ ctx, input }) => makeDraftsService(deps(ctx)).readDraft(input.draftId, ctx.storeId)),

  update: orgProcedure
    .meta({ purpose: "save the draft's details" })
    .input(
      draftId.extend({
        title: z.string().min(1).optional(),
        size: z.enum(["small", "medium", "large"]).optional(),
        priceCents: z.number().int().nonnegative().optional(),
      }),
    )
    .mutation(({ ctx, input: { draftId, ...details } }) =>
      makeDraftsService(deps(ctx)).updateDraft(draftId, ctx.storeId, details),
    ),
});
