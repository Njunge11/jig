/** The words of a failure, and the one place that shows a failed mutation (frontend-standards 56). */
import type { Mutation } from "@tanstack/react-query";
import { TRPCClientError } from "@trpc/client";
import { toast } from "sonner";
import type { AppRouter } from "./routers/_app";

declare module "@tanstack/react-query" {
  interface Register {
    /** Each mutation names its failure, or says that it shows the failure itself. */
    mutationMeta: { failureTitle: string } | { showsOwnFailure: true };
  }
}

const NO_ANSWER = "The server gave no answer. Check your connection and try again.";
const UNEXPECTED = "The page had an error. Try again.";

function isTRPCClientError(error: unknown): error is TRPCClientError<AppRouter> {
  return error instanceof TRPCClientError;
}

/** The message of a failure, and the reference of the server when nobody expected the failure. */
export function describeFailure(error: unknown): { message: string; reference?: string; field?: string } {
  if (isTRPCClientError(error)) {
    if (!error.data) return { message: NO_ANSWER };
    const reference = error.data.code === "INTERNAL_SERVER_ERROR" ? error.data.requestId : undefined;
    return { message: error.message, reference, field: error.data.field };
  }
  const digest = typeof error === "object" && error !== null && "digest" in error ? String(error.digest) : undefined;
  return { message: UNEXPECTED, reference: digest };
}

/** True when the server sent the failure on purpose. The same request gets the same answer. */
export function isExpectedFailure(error: unknown): boolean {
  return isTRPCClientError(error) && Boolean(error.data) && error.data?.code !== "INTERNAL_SERVER_ERROR";
}

/** The `onError` of the `MutationCache`: the toast of each failed mutation. */
export function showMutationFailure(error: unknown, mutation: Mutation<unknown, unknown, unknown, unknown>) {
  const meta = mutation.meta;
  if (meta && "showsOwnFailure" in meta) return;
  const { message, reference } = describeFailure(error);
  toast.error(meta?.failureTitle ?? "The change was not saved", {
    id: mutation.options.scope?.id,
    description: reference ? `${message} Reference: ${reference}` : message,
  });
}
