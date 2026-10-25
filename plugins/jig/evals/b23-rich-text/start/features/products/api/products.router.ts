/** The products resource's procedures. */
import { z } from "zod";
import type { Db } from "@/db/types";
import { createTRPCRouter, orgProcedure } from "@/lib/trpc/init";
import { makeProductsRepo } from "../db/products.repo";
import { makeProductsService } from "./products.service";

const deps = (ctx: { db: Db }) => ({ repo: makeProductsRepo(ctx.db) });

export const productsRouter = createTRPCRouter({
  list: orgProcedure
    .meta({ purpose: "list the store's products" })
    .input(z.object({}))
    .query(({ ctx }) => makeProductsService(deps(ctx)).list(ctx.storeId)),

  byId: orgProcedure
    .meta({ purpose: "read the product the editor edits" })
    .input(z.object({ productId: z.string() }))
    .query(({ ctx, input }) => makeProductsService(deps(ctx)).byId(input.productId, ctx.storeId)),
});
