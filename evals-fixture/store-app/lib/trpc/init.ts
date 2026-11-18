import { initTRPC, TRPCError } from "@trpc/server";
import { cookies } from "next/headers";
import { cache } from "react";
import { traceBlock } from "@/db/call-trace";
import { db } from "@/db/client";
import type { Db } from "@/db/types";
import { formatFailure, type NoReturnedFailure } from "./returned-failure";

export { orThrow } from "./returned-failure";

export type Session = { userId: string; storeId: string | null };

export type Context = {
  db: Db;
  session: Session | null;
  /** The identifier of this request. Each log line of the request starts with it. */
  requestId: string;
  log: (line: string, cause?: unknown) => void;
};

/** What a procedure is for, in plain words: the root line of its call trace. */
export type Meta = { purpose?: string };

// The fixture has no auth provider: the session is the store id in the "store" cookie.
// Every request reads it, so every page is dynamic.
export const createTRPCContext = cache(async (): Promise<Context> => {
  const storeId = (await cookies()).get("store")?.value ?? null;
  const requestId = crypto.randomUUID();
  return {
    db,
    session: storeId ? { userId: "u1", storeId } : null,
    requestId,
    log: (line, cause) => console.info(`[${requestId}] ${line}`, ...(cause ? [cause] : [])),
  };
});

const t = initTRPC.context<Context>().meta<Meta>().create({ errorFormatter: formatFailure });

export const createTRPCRouter = <T extends Parameters<typeof t.router>[0]>(procedures: T & NoReturnedFailure<T>) =>
  t.router<T>(procedures);
export const mergeRouters = t.mergeRouters;
export const createCallerFactory = t.createCallerFactory;

// The first middleware opens the call-trace root, so every later check and call is one of its lines.
// It logs each failure with the identifier of the request.
export const publicProcedure = t.procedure.use(async ({ ctx, meta, path, next }) => {
  const result = await traceBlock(`calling ${path} to ${meta?.purpose ?? "serve the request"}`, next, {
    log: ctx.log,
    describe: (answer) => (answer.ok ? "success" : `failed: ${answer.error.message}`),
  });
  if (!result.ok) ctx.log(`${path} ${result.error.code}: ${result.error.message}`, result.error.cause);
  return result;
});

export const protectedProcedure = publicProcedure.use(({ ctx, next }) => {
  if (!ctx.session) throw new TRPCError({ code: "UNAUTHORIZED", message: "Your session ended. Sign in again." });
  return next({ ctx: { ...ctx, session: ctx.session } });
});

export const orgProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (!ctx.session.storeId) {
    throw new TRPCError({ code: "FORBIDDEN", message: "You have no store. Ask the owner of the store for access." });
  }
  return next({ ctx: { ...ctx, storeId: ctx.session.storeId } });
});
