/**
 * Registers a mutating tool behind the server-derived idempotency key:
 * session id + tool name + SHA-256 of the canonical arguments. The first
 * result is kept for an hour and replayed on a repeat; a repeat while the
 * first call runs waits for it. Same shape as `server.registerTool`.
 */
import { createHash } from "node:crypto";
import type { McpServer, ToolCallback } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { AnySchema, ZodRawShapeCompat } from "@modelcontextprotocol/sdk/server/zod-compat.js";
import type { CallToolResult, ToolAnnotations } from "@modelcontextprotocol/sdk/types.js";

const TTL_MS = 60 * 60 * 1000;

const results = new Map<string, { result: Promise<CallToolResult>; expiresAt: number }>();

// The config `server.registerTool` takes.
type Config<In, Out> = {
  title?: string;
  description?: string;
  inputSchema?: In;
  outputSchema?: Out;
  annotations?: ToolAnnotations;
  _meta?: Record<string, unknown>;
};

function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (value && typeof value === "object") {
    const entries = Object.entries(value).sort(([a], [b]) => a.localeCompare(b));
    return `{${entries.map(([k, v]) => `${JSON.stringify(k)}:${canonical(v)}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

function keyFor(sessionId: string | undefined, name: string, args: unknown) {
  return `${sessionId ?? "-"}:${name}:${createHash("sha256").update(canonical(args)).digest("hex")}`;
}

function replayOrRun(key: string, run: () => Promise<CallToolResult>, now: number) {
  const kept = results.get(key);
  if (kept && kept.expiresAt > now) return kept.result;
  const result = run();
  results.set(key, { result, expiresAt: now + TTL_MS });
  return result;
}

export function registerIdempotentTool<In extends ZodRawShapeCompat | AnySchema, Out extends ZodRawShapeCompat | AnySchema>(
  server: McpServer,
  name: string,
  config: Config<In, Out>,
  handler: ToolCallback<In>,
) {
  const call = handler as (args: unknown, extra: { sessionId?: string }) => CallToolResult | Promise<CallToolResult>;
  const deduplicated = (args: unknown, extra: { sessionId?: string }) =>
    replayOrRun(keyFor(extra.sessionId, name, args), async () => call(args, extra), Date.now());
  return server.registerTool(name, { ...config, annotations: { ...config.annotations, idempotentHint: true } }, deduplicated as ToolCallback<In>);
}
