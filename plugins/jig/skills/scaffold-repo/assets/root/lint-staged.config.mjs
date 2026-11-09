import fs from "node:fs";
import path from "node:path";

/**
 * One repo-wide lint-staged config. Files are routed by their path, so a new
 * app or package needs no lint-staged block of its own.
 *
 * ESLint runs with the package as its cwd: the flat config is resolved from
 * cwd and the Next plugin looks for `app/` under cwd. Prettier is config-less,
 * so one root invocation formats everything.
 */

const LINT_EXT = /\.(?:ts|tsx|js|jsx|mjs)$/;
const FORMAT_EXT = /\.(?:ts|tsx|js|jsx|mjs|json|css|md)$/;

/** The workspace package a file lives in ("apps/admin"), or null for root files. */
function packageDir(absFile) {
  const rel = path.relative(process.cwd(), absFile);
  const match = rel.match(/^((?:apps|packages)\/[^/]+)\//);
  return match ? match[1] : null;
}

const ESLINT_CONFIG_FILES = ["eslint.config.mjs", "eslint.config.js"];

function hasEslintConfig(pkg) {
  return ESLINT_CONFIG_FILES.some((name) =>
    fs.existsSync(path.join(pkg, name)),
  );
}

const quote = (file) => JSON.stringify(file);

export default (stagedFiles) => {
  const commands = [];

  const lintByPackage = new Map();
  for (const file of stagedFiles) {
    if (!LINT_EXT.test(file)) continue;
    const pkg = packageDir(file);
    if (!pkg || !hasEslintConfig(pkg)) continue;
    const files = lintByPackage.get(pkg) ?? [];
    files.push(file);
    lintByPackage.set(pkg, files);
  }
  for (const [pkg, files] of lintByPackage) {
    commands.push(
      `pnpm -C ${pkg} exec eslint --fix --max-warnings=0 --no-warn-ignored ${files.map(quote).join(" ")}`,
    );
  }

  const formattable = stagedFiles.filter((file) => FORMAT_EXT.test(file));
  if (formattable.length > 0) {
    commands.push(`prettier --write ${formattable.map(quote).join(" ")}`);
  }

  return commands;
};
