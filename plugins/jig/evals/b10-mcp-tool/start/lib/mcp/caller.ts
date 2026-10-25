/** The store an MCP call acts on: the route's auth step puts it on the request's auth info. */
import type { AuthInfo } from "@modelcontextprotocol/sdk/server/auth/types.js";

export function mcpCaller(extra: { authInfo?: AuthInfo }): { storeId: string } | null {
  const storeId = extra.authInfo?.extra?.storeId;
  return typeof storeId === "string" ? { storeId } : null;
}
