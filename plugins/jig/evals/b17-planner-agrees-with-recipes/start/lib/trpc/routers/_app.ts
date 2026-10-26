import type { inferRouterOutputs } from "@trpc/server";
import { homeRouter } from "@/features/home/api/home.router";
import { productsRouter } from "@/features/products/api/products.router";
import { createTRPCRouter } from "../init";

export const appRouter = createTRPCRouter({
  home: homeRouter,
  products: productsRouter,
});

export type AppRouter = typeof appRouter;
export type RouterOutputs = inferRouterOutputs<AppRouter>;
