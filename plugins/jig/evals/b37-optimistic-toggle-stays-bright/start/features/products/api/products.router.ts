/** The products resource's procedures. */
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import type { Db } from "@/db/types";
import { createTRPCRouter, orgProcedure } from "@/lib/trpc/init";
import { makeProductsRepo } from "../db/products.repo";
import { makeProductsService } from "./products.service";

const deps = (ctx: { db: Db }) => ({ repo: makeProductsRepo(ctx.db) });

function found<T>(row: T | null) {
  if (!row) throw new TRPCError({ code: "NOT_FOUND", message: "This product does not exist" });
  return row;
}

export const productsRouter = createTRPCRouter({
  list: orgProcedure
    .meta({ purpose: "list the store's products" })
    .input(z.object({}))
    .query(({ ctx }) => makeProductsService(deps(ctx)).list(ctx.storeId)),

  setFeatured: orgProcedure
    .meta({ purpose: "mark one of the store's products featured or not" })
    .input(z.object({ id: z.string().min(1), featured: z.boolean() }))
    .mutation(({ ctx, input }) =>
      makeProductsService(deps(ctx)).setFeatured(ctx.storeId, input.id, input.featured).then(found),
    ),
});
