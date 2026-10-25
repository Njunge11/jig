import { cookies } from "next/headers";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { makeMcpServer } from "@/lib/mcp/server";

// The MCP endpoint (Streamable HTTP). The fixture has no OAuth provider: the store id comes from the "store" cookie.
async function handle(req: Request) {
  const storeId = (await cookies()).get("store")?.value;
  const server = makeMcpServer();
  const transport = new WebStandardStreamableHTTPServerTransport({ sessionIdGenerator: () => crypto.randomUUID() });
  await server.connect(transport);
  const authInfo = storeId ? { token: storeId, clientId: "store-app", scopes: [], extra: { storeId } } : undefined;
  return transport.handleRequest(req, { authInfo });
}

export { handle as GET, handle as POST, handle as DELETE };
