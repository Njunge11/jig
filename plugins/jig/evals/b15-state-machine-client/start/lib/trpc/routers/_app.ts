import type { inferRouterOutputs } from "@trpc/server";
import { productDraftRouter } from "@/features/product-draft/api/product-draft.router";
import { productsRouter } from "@/features/products/api/products.router";
import { createTRPCRouter } from "../init";

export const appRouter = createTRPCRouter({
  productDraft: productDraftRouter,
  products: productsRouter,
});

export type AppRouter = typeof appRouter;
export type RouterOutputs = inferRouterOutputs<AppRouter>;
