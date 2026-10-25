/** The products resource's procedures. */
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import type { Db } from "@/db/types";
import { makeReviewsRepo } from "@/features/reviews/db/reviews.repo";
import { createTRPCRouter, orgProcedure } from "@/lib/trpc/init";
import { makeProductsRepo } from "../db/products.repo";
import { makeProductsService } from "./products.service";
import { makeRemoveProductService, type RemoveProductRepos } from "./remove-product.service";

const products = (ctx: { db: Db }) => makeProductsService({ repo: makeProductsRepo(ctx.db) });

const removeProduct = (ctx: { db: Db }) =>
  makeRemoveProductService({
    write: <T>(run: (repos: RemoveProductRepos) => Promise<T>) =>
      ctx.db.transaction((tx) => run({ products: makeProductsRepo(tx), reviews: makeReviewsRepo(tx) })),
  });

function found<T>(row: T | null) {
  if (!row) throw new TRPCError({ code: "NOT_FOUND", message: "This product does not exist" });
  return row;
}

const byIdInput = z.object({ id: z.string().min(1) });

export const productsRouter = createTRPCRouter({
  list: orgProcedure
    .meta({ purpose: "list the store's products" })
    .input(z.object({}))
    .query(({ ctx }) => products(ctx).list(ctx.storeId)),

  byId: orgProcedure
    .meta({ purpose: "read one product's details" })
    .input(byIdInput)
    .query(({ ctx, input }) => products(ctx).byId(ctx.storeId, input.id).then(found)),

  update: orgProcedure
    .meta({ purpose: "save a product's title and brand" })
    .input(z.object({ id: z.string().min(1), title: z.string().trim().min(1).max(120), brand: z.string().trim().max(80) }))
    .mutation(({ ctx, input: { id, ...details } }) => products(ctx).update(ctx.storeId, id, details).then(found)),

  delete: orgProcedure
    .meta({ purpose: "delete a product and its reviews" })
    .input(byIdInput)
    .mutation(({ ctx, input }) => removeProduct(ctx).removeProduct(ctx.storeId, input.id).then(found)),
});
