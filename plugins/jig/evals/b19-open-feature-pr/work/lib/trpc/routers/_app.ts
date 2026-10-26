import type { inferRouterOutputs } from "@trpc/server";
import { invitationsRouter } from "@/features/members/api/invitations.router";
import { productsRouter } from "@/features/products/api/products.router";
import { createTRPCRouter } from "../init";

export const appRouter = createTRPCRouter({
  invitations: invitationsRouter,
  products: productsRouter,
});

export type AppRouter = typeof appRouter;
export type RouterOutputs = inferRouterOutputs<AppRouter>;
