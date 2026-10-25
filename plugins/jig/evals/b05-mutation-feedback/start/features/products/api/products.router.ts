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

const byId = z.object({ id: z.string().min(1) });

export const productsRouter = createTRPCRouter({
  list: orgProcedure
    .meta({ purpose: "list the store's active products" })
    .input(z.object({}))
    .query(({ ctx }) => makeProductsService(deps(ctx)).list(ctx.storeId)),

  archive: orgProcedure
    .meta({ purpose: "archive one of the store's products" })
    .input(byId)
    .mutation(({ ctx, input }) => makeProductsService(deps(ctx)).archive(ctx.storeId, input.id).then(found)),

  unarchive: orgProcedure
    .meta({ purpose: "restore one of the store's archived products" })
    .input(byId)
    .mutation(({ ctx, input }) => makeProductsService(deps(ctx)).unarchive(ctx.storeId, input.id).then(found)),
});
