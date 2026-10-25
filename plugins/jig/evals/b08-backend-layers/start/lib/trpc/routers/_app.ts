import type { inferRouterOutputs } from "@trpc/server";
import { ordersRouter } from "@/features/orders/api/orders.router";
import { productsRouter } from "@/features/products/api/products.router";
import { createTRPCRouter } from "../init";

export const appRouter = createTRPCRouter({
  orders: ordersRouter,
  products: productsRouter,
});

export type AppRouter = typeof appRouter;
export type RouterOutputs = inferRouterOutputs<AppRouter>;
