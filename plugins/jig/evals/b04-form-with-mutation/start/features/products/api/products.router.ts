/** The products resource's procedures. */
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import type { Db } from "@/db/types";
import { createTRPCRouter, orgProcedure } from "@/lib/trpc/init";
import { makeProductsRepo } from "../db/products.repo";
import { type CreateProduct, makeProductsService } from "./products.service";

const deps = (ctx: { db: Db }) => ({
  repo: makeProductsRepo(ctx.db),
  now: () => new Date(),
  uuid: () => crypto.randomUUID(),
});

async function createProduct(ctx: { db: Db; storeId: string }, input: CreateProduct) {
  const result = await makeProductsService(deps(ctx)).create(ctx.storeId, input);
  if (result.status === "titleTaken") {
    throw new TRPCError({
      code: "CONFLICT",
      message: "A product with this title exists",
      cause: { field: "title", message: "A product with this title exists" },
    });
  }
  return result.product;
}

export const productsRouter = createTRPCRouter({
  list: orgProcedure
    .meta({ purpose: "list the store's products" })
    .input(z.object({}))
    .query(({ ctx }) => makeProductsService(deps(ctx)).list(ctx.storeId)),

  create: orgProcedure
    .meta({ purpose: "add a product to the store" })
    .input(
      z.object({
        title: z.string().trim().min(3).max(120),
        size: z.enum(["small", "medium", "large"]),
      }),
    )
    .mutation(({ ctx, input }) => createProduct(ctx, input)),
});
