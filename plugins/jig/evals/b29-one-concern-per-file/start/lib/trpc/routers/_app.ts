import type { inferRouterOutputs } from "@trpc/server";
import { draftsRouter } from "@/features/drafts/api/drafts.router";
import { productsRouter } from "@/features/products/api/products.router";
import { createTRPCRouter } from "../init";

export const appRouter = createTRPCRouter({
  drafts: draftsRouter,
  products: productsRouter,
});

export type AppRouter = typeof appRouter;
export type RouterOutputs = inferRouterOutputs<AppRouter>;
