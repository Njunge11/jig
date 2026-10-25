/** The orders resource's procedures. */
import type { Db } from "@/db/types";
import { createTRPCRouter, orgProcedure } from "@/lib/trpc/init";
import { makeOrdersRepo } from "../db/orders.repo";
import { makeOrderStagesService } from "./order-stages.service";

const deps = (ctx: { db: Db }) => ({ repo: makeOrdersRepo(ctx.db) });

export const ordersRouter = createTRPCRouter({
  stages: orgProcedure
    .meta({ purpose: "read the stage of every order the chat shows" })
    .query(({ ctx }) => makeOrderStagesService(deps(ctx)).readStages(ctx.storeId)),
});
