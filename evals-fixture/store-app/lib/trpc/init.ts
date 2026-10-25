import { initTRPC, TRPCError } from "@trpc/server";
import { cache } from "react";
import { traceBlock } from "@/db/call-trace";
import { db } from "@/db/client";
import type { Db } from "@/db/types";

export type Session = { userId: string; storeId: string | null };

export type Context = { db: Db; session: Session | null; log: (block: string) => void };

/** What a procedure is for, in plain words: the root line of its call trace. */
export type Meta = { purpose?: string };

// The fixture has no auth provider; a deployed app reads the session from its auth library here.
export const createTRPCContext = cache(async (): Promise<Context> => ({ db, session: null, log: console.info }));

const t = initTRPC.context<Context>().meta<Meta>().create();

export const createTRPCRouter = t.router;
export const mergeRouters = t.mergeRouters;
export const createCallerFactory = t.createCallerFactory;

// The first middleware opens the call-trace root, so every later check and call is one of its lines.
export const publicProcedure = t.procedure.use(({ ctx, meta, path, next }) =>
  traceBlock(`calling ${path} to ${meta?.purpose ?? "serve the request"}`, next, {
    log: ctx.log,
    describe: (result) => (result.ok ? "success" : `failed: ${result.error.message}`),
  }),
);

export const protectedProcedure = publicProcedure.use(({ ctx, next }) => {
  if (!ctx.session) throw new TRPCError({ code: "UNAUTHORIZED" });
  return next({ ctx: { ...ctx, session: ctx.session } });
});

export const orgProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (!ctx.session.storeId) throw new TRPCError({ code: "FORBIDDEN" });
  return next({ ctx: { ...ctx, storeId: ctx.session.storeId } });
});
