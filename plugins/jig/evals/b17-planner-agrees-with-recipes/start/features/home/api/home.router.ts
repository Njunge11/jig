/** The home resource's procedures. */
import type { Db } from "@/db/types";
import { createTRPCRouter, orgProcedure } from "@/lib/trpc/init";
import { makeHomeRepo } from "../db/home.repo";
import { makeHomeService } from "./home.service";

const deps = (ctx: { db: Db }) => ({ repo: makeHomeRepo(ctx.db) });

export const homeRouter = createTRPCRouter({
  overview: orgProcedure
    .meta({ purpose: "read the store's home page" })
    .query(({ ctx }) => makeHomeService(deps(ctx)).overview(ctx.storeId)),
});
