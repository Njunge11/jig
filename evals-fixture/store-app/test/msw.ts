import { setupServer } from "msw/node";
import { createTRPCMsw, httpLink } from "msw-trpc";
import type { AppRouter } from "@/lib/trpc/routers/_app";

export const TRPC_URL = "http://localhost:3000/api/trpc";

export const trpcMsw = createTRPCMsw<AppRouter>({ links: [httpLink({ url: TRPC_URL })] });
export const server = setupServer();
