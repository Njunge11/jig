import { existsSync, readdirSync, rmSync } from "node:fs";
import path from "node:path";

/**
 * Empties the build folder of an app before the build of a run:
 * `node support/clean-build.ts apps/<app>/.next`.
 *
 * A cached build goes on top of the folder of the last build: turbo adds its
 * files and removes none. The pages that the last server saved there
 * (`server/route-cache`) stay, and the new server shows the screens of the
 * last build. `next build` empties the folder at its start and keeps the
 * five names below (the `clean` step of `next/dist/build/index.js`). The
 * run does the same, so a cached build and a new build start from the same
 * folder. `dev` is the folder of the dev server that the developer runs.
 */
const KEPT = new Set(["cache", "dev", "diagnostics", "lock", "trace"]);

const folder = process.argv[2];
if (!folder || path.basename(folder) !== ".next") {
  throw new Error("Give the build folder of the app: apps/<app>/.next");
}
if (existsSync(folder)) {
  for (const name of readdirSync(folder)) {
    if (!KEPT.has(name)) {
      rmSync(path.join(folder, name), { recursive: true, force: true });
    }
  }
}
