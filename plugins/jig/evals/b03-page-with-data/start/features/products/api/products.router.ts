/** The products resource's procedures. */
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import type { Db } from "@/db/types";
import { createTRPCRouter, orgProcedure } from "@/lib/trpc/init";
import { makeProductsRepo } from "../db/products.repo";
import { makeProductsService } from "./products.service";

const deps = (ctx: { db: Db }) => ({ repo: makeProductsRepo(ctx.db) });

async function readProduct(ctx: { db: Db; storeId: string }, id: string) {
  const product = await makeProductsService(deps(ctx)).byId(ctx.storeId, id);
  if (!product) throw new TRPCError({ code: "NOT_FOUND", message: "This product does not exist" });
  return product;
}

export const productsRouter = createTRPCRouter({
  list: orgProcedure
    .meta({ purpose: "list the store's products" })
    .input(z.object({}))
    .query(({ ctx }) => makeProductsService(deps(ctx)).list(ctx.storeId)),

  byId: orgProcedure
    .meta({ purpose: "read one of the store's products" })
    .input(z.object({ id: z.string().min(1) }))
    .query(({ ctx, input }) => readProduct(ctx, input.id)),
});
