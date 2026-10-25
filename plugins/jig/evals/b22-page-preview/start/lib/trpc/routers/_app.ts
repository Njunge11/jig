import type { inferRouterOutputs } from "@trpc/server";
import { productsRouter } from "@/features/products/api/products.router";
import { storefrontRouter } from "@/features/storefront/api/storefront.router";
import { createTRPCRouter } from "../init";

export const appRouter = createTRPCRouter({
  products: productsRouter,
  storefront: storefrontRouter,
});

export type AppRouter = typeof appRouter;
export type RouterOutputs = inferRouterOutputs<AppRouter>;
