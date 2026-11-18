/** How a failure leaves a tRPC procedure (backend-standards, "Error handling"). `init.ts` uses each export. */
import type { AnyMutationProcedure, inferProcedureOutput, TRPCDefaultErrorShape } from "@trpc/server";
import { TRPCError } from "@trpc/server";

/** The one sentence a client gets for a failure that nobody threw on purpose. */
export const UNEXPECTED = "The server had an error. Try again.";

/** The status of a failure that a service returns, and the tRPC code that carries it. A new status is one line here. */
const FAILURE_CODE = {
  notFound: "NOT_FOUND",
  forbidden: "FORBIDDEN",
  refused: "CONFLICT",
  invalid: "BAD_REQUEST",
} as const;

/** A failure that a service returns. `field` names the form field that the message belongs to. */
export type Failure = { status: keyof typeof FAILURE_CODE; message: string; field?: string };

class ReturnedFailure extends TRPCError {
  constructor(
    failure: Failure,
    readonly field = failure.field,
  ) {
    super({ code: FAILURE_CODE[failure.status], message: failure.message });
  }
}

function isFailure(value: unknown): value is Failure {
  if (typeof value !== "object" || value === null || !("status" in value) || !("message" in value)) return false;
  return typeof value.status === "string" && value.status in FAILURE_CODE && typeof value.message === "string";
}

/** Hands the answer of a service to the client. A returned failure leaves as a `TRPCError` with its message. */
export async function orThrow<T>(answer: Promise<T> | T): Promise<Exclude<T, Failure>> {
  const value = await answer;
  if (isFailure(value)) throw new ReturnedFailure(value);
  return value as Exclude<T, Failure>;
}

/** The `errorFormatter` of `initTRPC.create`: no text of an unexpected failure, and the identifier of the request. */
export function formatFailure<TShape extends TRPCDefaultErrorShape>(opts: {
  shape: TShape;
  error: TRPCError;
  ctx: { requestId: string } | undefined;
}) {
  const { shape, error, ctx } = opts;
  return {
    ...shape,
    message: error.code === "INTERNAL_SERVER_ERROR" ? UNEXPECTED : shape.message,
    data: {
      ...shape.data,
      stack: undefined,
      requestId: ctx?.requestId,
      field: error instanceof ReturnedFailure ? error.field : undefined,
    },
  };
}

/** The type of the argument of `createTRPCRouter`: a mutation that can answer a returned failure is a type error. */
export type NoReturnedFailure<T> = {
  [K in keyof T]: T[K] extends AnyMutationProcedure
    ? [Extract<inferProcedureOutput<T[K]>, Failure>] extends [never]
      ? T[K]
      : "this mutation hands a returned failure to the client: wrap the service call in orThrow"
    : T[K];
};
