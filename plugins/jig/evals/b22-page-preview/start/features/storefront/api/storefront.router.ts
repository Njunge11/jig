/** The public shop's procedures. */
import { z } from "zod";
import type { Db } from "@/db/types";
import { createTRPCRouter, publicProcedure } from "@/lib/trpc/init";
import { makeStorefrontProductsRepo } from "../db/storefront-products.repo";
import { makeStorefrontProductService } from "./storefront-product.service";

const deps = (ctx: { db: Db }) => ({ repo: makeStorefrontProductsRepo(ctx.db) });

export const storefrontRouter = createTRPCRouter({
  product: publicProcedure
    .meta({ purpose: "read the product the public page shows" })
    .input(z.object({ productId: z.string() }))
    .query(({ ctx, input }) => makeStorefrontProductService(deps(ctx)).product(input.productId)),
});
