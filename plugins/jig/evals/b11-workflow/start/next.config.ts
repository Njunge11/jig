import type { NextConfig } from "next";
import { withWorkflow } from "workflow/next";

// PGlite reads its wasm and data files with Node's fs, so Node loads it unbundled.
const nextConfig: NextConfig = { serverExternalPackages: ["@electric-sql/pglite"] };

// withWorkflow compiles the "use workflow" and "use step" directives.
export default withWorkflow(nextConfig);
