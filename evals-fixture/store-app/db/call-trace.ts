import { AsyncLocalStorage } from "node:async_hooks";

/**
 * The call trace log (backend-standards, "The call trace").
 *
 * `trace` and `traceRoot` build a tree of what one request did, in memory,
 * while it runs. Nothing is built and nothing costs a cycle beyond one env
 * read when `TRACE_LOG` is not `1`. The tree is read back with
 * `takeTrace`, by the key the root was stored under, and rendered with
 * `renderTrace` in the call-trace format.
 */

/** One call or one query, with the calls it made under it, in start order. */
export type TraceEntry = {
  /** The line's own text, before its result and its time: "calling X to Y",
   * "query select company_members". */
  label: string;
  /** The result word(s) after the label: "success", "yes",
   * `refused: "<message>"`, `failed: <message>`. A query entry carries none. */
  result?: string;
  /** How long the call took, in milliseconds. */
  ms: number;
  children: TraceEntry[];
};

/** The entry a nested `trace`/`traceQuery` call attaches itself under. */
const currentEntry = new AsyncLocalStorage<TraceEntry>();

/** The statuses that read as a refusal, not a thrown error. */
const REFUSAL_STATUSES = new Set([
  "refused",
  "forbidden",
  "invalid",
  "notFound",
]);

/** The refusal message a call's result carries, or `null` when it carries none. */
function refusalMessage(value: unknown): string | null {
  if (typeof value !== "object" || value === null) return null;
  const status = (value as Record<string, unknown>).status;
  const message = (value as Record<string, unknown>).message;
  if (typeof status !== "string" || !REFUSAL_STATUSES.has(status)) return null;
  return typeof message === "string" ? message : null;
}

function failureMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/** A call's label: fixed text, or read off its result — `undefined` on a
 * `fn` that threw — for a purpose only known once the call answers, like
 * `appendToDraft`'s "save version <n>". */
export type TraceLabel<T> = string | ((result: T | undefined) => string);

function labelOf<T>(label: TraceLabel<T>, result: T | undefined): string {
  return typeof label === "string" ? label : label(result);
}

/** Runs `fn` as one entry under whichever entry is open on the store, timing
 * it and resolving its result text with `resultOf`. A call with no open entry
 * (a `trace`/`traceQuery` reached outside any `traceRoot`) runs `fn` alone. */
async function record<T>(
  label: TraceLabel<T>,
  fn: () => T | PromiseLike<T>,
  resultOf: (result: T) => string | undefined,
): Promise<T> {
  const parent = currentEntry.getStore();
  if (!parent) return await fn();

  const entry: TraceEntry = {
    label: typeof label === "string" ? label : "",
    ms: 0,
    children: [],
  };
  parent.children.push(entry);
  const startedAt = performance.now();
  try {
    const result = await currentEntry.run(entry, async () => await fn());
    entry.ms = performance.now() - startedAt;
    entry.label = labelOf(label, result);
    entry.result = resultOf(result);
    return result;
  } catch (error) {
    entry.ms = performance.now() - startedAt;
    entry.label = labelOf(label, undefined);
    entry.result = `failed: ${failureMessage(error)}`;
    throw error;
  }
}

/** The result word for a call: its refusal, its `describe`, or `success`.
 * Exported for a root whose `describe` unwraps the call's own value first,
 * such as a tRPC procedure's `{ ok, data }` result. */
export function callResultOf<T>(
  result: T,
  describe?: (result: T) => string,
): string {
  const refusal = refusalMessage(result);
  if (refusal !== null) return `refused: "${refusal}"`;
  return describe ? describe(result) : "success";
}

/**
 * One call, under whichever call is open on the current trace.
 *
 * With `TRACE_LOG` unset this is `fn()` and nothing else: no tree, no store,
 * no timer read. With it set, and inside a `traceRoot`, it records one entry:
 * `line`, its result — `describe(result)` when given, its refusal when the
 * result carries one, `success` otherwise — and how long `fn` took. A `fn`
 * that throws records `failed: <message>` and the error is thrown again.
 */
export async function trace<T>(
  line: TraceLabel<T>,
  fn: () => T | PromiseLike<T>,
  describe?: (result: T) => string,
): Promise<T> {
  if (process.env.TRACE_LOG !== "1") return await fn();
  return record(line, fn, (result) => callResultOf(result, describe));
}

/**
 * One statement, under whichever call is open on the current trace. Never
 * carries a result word — a query is timed, not judged.
 */
export async function traceQuery<T>(
  label: string,
  fn: () => T | PromiseLike<T>,
): Promise<T> {
  if (process.env.TRACE_LOG !== "1") return await fn();
  return record(label, fn, () => undefined);
}

/** The `then` shape `traceLazyQuery` needs: enough of `PromiseLike` to await
 * a query and to know when it settles. */
type Thenable = {
  then: (
    onFulfilled?: ((value: unknown) => unknown) | null,
    onRejected?: ((reason: unknown) => unknown) | null,
  ) => unknown;
};

/**
 * Times a lazy thenable that its caller must keep chaining before awaiting —
 * postgres-js's `Query` (`client.unsafe(...)`), which does nothing until its
 * own `then` first runs, and whose chain methods (`values()`, `raw()`, …)
 * mutate `this` and return it. `traceQuery` cannot serve it: `traceQuery`
 * always awaits `fn` itself and hands back its own Promise, and a Promise has
 * no `values()` — the caller (drizzle) chains `.values()` on the object
 * `unsafe(...)` returns, before it ever awaits it.
 *
 * `query` keeps its identity: only its own `then` is replaced, once, so
 * `query.values()` still returns the same object with the same replaced
 * `then`. The clock starts and the entry opens at the first `then` call —
 * under whichever call is open in the store at that moment — because
 * postgres-js runs the query only then, even when the caller chained
 * `.values()` first. The entry records on success or on rejection, with no
 * result word (a query is timed, not judged, same as `traceQuery`); the
 * caller's own rejection is untouched, since it runs its own `then`
 * subscription on the same underlying settlement.
 */
export function traceLazyQuery<T extends Thenable>(label: string, query: T): T {
  if (process.env.TRACE_LOG !== "1") return query;

  const originalThen = query.then.bind(query);
  let started = false;

  query.then = (onFulfilled, onRejected) => {
    if (!started) {
      started = true;
      const parent = currentEntry.getStore();
      if (parent) {
        const entry: TraceEntry = { label, ms: 0, children: [] };
        parent.children.push(entry);
        const startedAt = performance.now();
        originalThen(
          () => {
            entry.ms = performance.now() - startedAt;
          },
          (error: unknown) => {
            entry.ms = performance.now() - startedAt;
            entry.result = `failed: ${failureMessage(error)}`;
          },
        );
      }
    }
    return originalThen(onFulfilled, onRejected);
  };

  return query;
}

/** How long a stored tree survives once nobody has taken it. */
const STORED_TREE_TTL_MS = 10 * 60 * 1000;

const storedTrees = new Map<
  string,
  { entry: TraceEntry; timer: ReturnType<typeof setTimeout> }
>();

function storeTree(key: string, entry: TraceEntry): void {
  const existing = storedTrees.get(key);
  if (existing) clearTimeout(existing.timer);
  const timer = setTimeout(() => storedTrees.delete(key), STORED_TREE_TTL_MS);
  timer.unref?.();
  storedTrees.set(key, { entry, timer });
}

/** The tree stored under `key`, removed from the store — or `undefined` when
 * no tree is stored under it (never traced, already taken, or expired). */
export function takeTrace(key: string): TraceEntry | undefined {
  const found = storedTrees.get(key);
  if (!found) return undefined;
  clearTimeout(found.timer);
  storedTrees.delete(key);
  return found.entry;
}

/**
 * The one call that starts a tree: no parent entry, its own `AsyncLocalStorage`
 * context, stored under `key` once `fn` settles — on success or on failure —
 * so a caller that failed still leaves a tree to read. Two roots running at
 * once keep separate trees, because each owns its own store context.
 *
 * With `TRACE_LOG` unset this is `fn()` alone: no tree is built, so nothing is
 * ever stored under `key`.
 */
export async function traceRoot<T>(
  key: string,
  line: string,
  fn: () => T | PromiseLike<T>,
  describe?: (result: T) => string,
): Promise<T> {
  if (process.env.TRACE_LOG !== "1") return await fn();

  const entry: TraceEntry = { label: line, ms: 0, children: [] };
  const startedAt = performance.now();
  try {
    const result = await currentEntry.run(entry, async () => await fn());
    entry.ms = performance.now() - startedAt;
    entry.result = callResultOf(result, describe);
    storeTree(key, entry);
    return result;
  } catch (error) {
    entry.ms = performance.now() - startedAt;
    entry.result = `failed: ${failureMessage(error)}`;
    storeTree(key, entry);
    throw error;
  }
}

/**
 * One entry and every call under it, in the call-trace format:
 * `calling <name> to <purpose>. <result>. took <seconds> s`, two spaces per
 * level, seconds with three decimals. A query entry carries no result word.
 */
export function renderTrace(entry: TraceEntry, depth = 0): string {
  const indent = "  ".repeat(depth);
  const resultPart = entry.result === undefined ? "" : ` ${entry.result}.`;
  const seconds = (entry.ms / 1000).toFixed(3);
  const line = `${indent}${entry.label}.${resultPart} took ${seconds} s`;
  const children = entry.children.map((child) => renderTrace(child, depth + 1));
  return [line, ...children].join("\n");
}

/** How one block's tree is keyed while it is built. Nobody else takes it, so
 * a counter is enough and no id has to be made. */
let blocksOpened = 0;

/**
 * One call that prints its own block.
 *
 * A call reached from a request that opens no root of its own — a tRPC
 * procedure, an eve hook — has no tree to nest under, so it starts one, takes
 * it back and prints it once the call settles, whether it answered or threw.
 *
 * With `TRACE_LOG` unset this is `fn()` and nothing else: no tree is built,
 * and nothing is printed.
 */
export async function traceBlock<T>(
  line: string,
  fn: () => T | PromiseLike<T>,
  options: {
    /** Where the rendered block goes. `console.info` by default. */
    log?: (block: string) => void;
    /** The root's result word, when `success` does not say it. */
    describe?: (result: T) => string;
  } = {},
): Promise<T> {
  if (process.env.TRACE_LOG !== "1") return await fn();

  blocksOpened += 1;
  const key = `block:${blocksOpened}`;
  try {
    return await traceRoot(key, line, fn, options.describe);
  } finally {
    const tree = takeTrace(key);
    if (tree) (options.log ?? console.info)(renderTrace(tree));
  }
}
