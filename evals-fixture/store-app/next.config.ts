import type { NextConfig } from "next";

// PGlite reads its wasm and data files with Node's fs, so Node loads it unbundled.
const nextConfig: NextConfig = {
  // `pnpm typecheck` checks the types (`bun check`). The build does not check
  // them a second time.
  typescript: { ignoreBuildErrors: true },
  serverExternalPackages: ["@electric-sql/pglite"],
};

export default nextConfig;
