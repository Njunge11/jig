import type { NextConfig } from "next";

// PGlite reads its wasm and data files with Node's fs, so Node loads it unbundled.
const nextConfig: NextConfig = { serverExternalPackages: ["@electric-sql/pglite"] };

export default nextConfig;
