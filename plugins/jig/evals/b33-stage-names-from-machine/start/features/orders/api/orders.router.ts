/** The orders resource's procedures. */
import { z } from "zod";
import type { Db } from "@/db/types";
import { createTRPCRouter, orgProcedure } from "@/lib/trpc/init";
import { makeOrdersRepo } from "../db/orders.repo";
import { makeOrdersService } from "./orders.service";

const deps = (ctx: { db: Db }) => ({ repo: makeOrdersRepo(ctx.db) });

export const ordersRouter = createTRPCRouter({
  list: orgProcedure
    .meta({ purpose: "list the store's orders in one stage" })
    .input(z.object({ status: z.string() }))
    .query(({ ctx, input }) => makeOrdersService(deps(ctx)).list(ctx.storeId, input.status)),

  counts: orgProcedure
    .meta({ purpose: "count the store's orders per stage" })
    .query(({ ctx }) => makeOrdersService(deps(ctx)).counts(ctx.storeId)),
});
