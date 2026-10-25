/** The products resource's procedures. */
import { z } from "zod";
import type { Db } from "@/db/types";
import { createTRPCRouter, orgProcedure } from "@/lib/trpc/init";
import { makeProductsRepo } from "../db/products.repo";
import { productEditSchema } from "./product-edit.schema";
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

  update: orgProcedure
    .meta({ purpose: "save the product's edits" })
    .input(productEditSchema.extend({ productId: z.string() }))
    .mutation(({ ctx, input: { productId, ...values } }) =>
      makeProductsService(deps(ctx)).update(productId, ctx.storeId, values),
    ),
});
