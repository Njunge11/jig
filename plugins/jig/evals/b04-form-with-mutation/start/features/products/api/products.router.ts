/** The products resource's procedures. */
import { z } from "zod";
import type { Db } from "@/db/types";
import { createTRPCRouter, orgProcedure, orThrow } from "@/lib/trpc/init";
import { makeProductsRepo } from "../db/products.repo";
import { makeProductsService } from "./products.service";

const deps = (ctx: { db: Db }) => ({
  repo: makeProductsRepo(ctx.db),
  now: () => new Date(),
  uuid: () => crypto.randomUUID(),
});

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
    .mutation(({ ctx, input }) => orThrow(makeProductsService(deps(ctx)).create(ctx.storeId, input))),
});
