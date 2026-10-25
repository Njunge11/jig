/** The products resource's procedures. */
import { z } from "zod";
import type { Db } from "@/db/types";
import { createTRPCRouter, orgProcedure } from "@/lib/trpc/init";
import { makeProductsRepo } from "../db/products.repo";
import { makeProductsService } from "./products.service";

const deps = (ctx: { db: Db }) => ({ repo: makeProductsRepo(ctx.db) });

const listInput = z.object({
  q: z.string().trim().max(200).default(""),
  page: z.number().int().min(1).default(1),
});

export const productsRouter = createTRPCRouter({
  list: orgProcedure
    .meta({ purpose: "list one page of the store's products" })
    .input(listInput)
    .query(({ ctx, input }) => makeProductsService(deps(ctx)).list(ctx.storeId, input)),
});
