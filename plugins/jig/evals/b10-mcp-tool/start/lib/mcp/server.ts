/** The app's one MCP server. Each feature's tools register here. */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

// One register function per tool file, from each feature's mcp/ folder.
const toolRegistrations: Array<(server: McpServer) => void> = [];

export function makeMcpServer() {
  const server = new McpServer({ name: "store", version: "1.0.0" });
  for (const register of toolRegistrations) register(server);
  return server;
}
