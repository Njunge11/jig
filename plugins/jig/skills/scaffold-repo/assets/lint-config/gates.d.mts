import type { OxlintConfig } from "oxlint";

/**
 * The jig lint gates as oxlint overrides, for the top-level folders given.
 * `pages`: globs of the route files that need loading.tsx and error.tsx.
 */
export declare function gates(
  trees: string[],
  options?: { pages?: string[] },
): NonNullable<OxlintConfig["overrides"]>;
