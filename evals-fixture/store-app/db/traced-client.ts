import { traceQuery } from "./call-trace";

/** The SQL verbs the trace's query label reads a table name for ("query <verb> <table>"). */
const LABELED_VERBS = new Set(["select", "insert", "update", "delete"]);

/** How long a query line stays readable when no table name is read off the statement. */
const FALLBACK_LABEL_LENGTH = 40;

/** The label one statement prints on the call trace: `query <verb> <table>`, or the statement's first characters. */
export function queryLabel(sql: string): string {
  const verb = /^\s*([a-zA-Z]+)/.exec(sql)?.[1]?.toLowerCase();
  if (!verb || !LABELED_VERBS.has(verb)) {
    return `query ${sql.slice(0, FALLBACK_LABEL_LENGTH)}`;
  }

  const tableMatch =
    verb === "update"
      ? /^\s*update\s+"?([a-zA-Z_][\w]*)"?/i.exec(sql)
      : /\b(?:from|into)\s+"?([a-zA-Z_][\w]*)"?/i.exec(sql);
  const table = tableMatch?.[1];

  return table ? `query ${verb} ${table}` : `query ${sql.slice(0, FALLBACK_LABEL_LENGTH)}`;
}

/**
 * Wraps a PGlite client so every statement it runs times itself on the call trace.
 * A statement inside a transaction records under whichever call opened it; the
 * wrapper only makes sure the transaction's own scoped client is timed too.
 * With `TRACE_LOG` unset, `traceQuery` is `fn()`, so the wrapper costs one call per statement.
 */
export function tracedClient<T extends object>(client: T): T {
  return new Proxy(client, {
    get(target, prop) {
      const value: unknown = Reflect.get(target, prop, target);
      if (typeof value !== "function") return value;

      if (prop === "query") {
        return (...args: unknown[]) => {
          const sql = typeof args[0] === "string" ? args[0] : "";
          return traceQuery(queryLabel(sql), () => value.apply(target, args));
        };
      }

      if (prop === "transaction") {
        return (...args: unknown[]) => {
          const [callback, ...rest] = args;
          if (typeof callback !== "function") return value.apply(target, args);
          const wrapped = (tx: object) => callback.apply(undefined, [tracedClient(tx)]);
          return value.apply(target, [wrapped, ...rest]);
        };
      }

      return value.bind(target);
    },
  });
}
