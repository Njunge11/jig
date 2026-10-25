/** The orders resource's procedures. */
import { z } from "zod";
import type { Db } from "@/db/types";
import { createTRPCRouter, orgProcedure } from "@/lib/trpc/init";
import { makeOrdersRepo, orderTabs } from "../db/orders.repo";
import { makeOrdersService } from "./orders.service";

const deps = (ctx: { db: Db }) => ({ repo: makeOrdersRepo(ctx.db) });

export const ordersRouter = createTRPCRouter({
  list: orgProcedure
    .meta({ purpose: "list the store's orders in one tab" })
    .input(z.object({ tab: z.enum(orderTabs) }))
    .query(({ ctx, input }) => makeOrdersService(deps(ctx)).list(ctx.storeId, input.tab)),

  counts: orgProcedure
    .meta({ purpose: "count the store's orders per tab" })
    .query(({ ctx }) => makeOrdersService(deps(ctx)).counts(ctx.storeId)),
});
