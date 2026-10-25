import { test } from "node:test";
import assert from "node:assert/strict";
import { decide } from "./reviewer-read-only.mjs";

const reviewer = (command, tool_name = "Bash", agent_type = "jig:backend-feature-reviewer") => ({
  agent_type,
  tool_name,
  tool_input: { command },
});

test("a session that is not a reviewer is never blocked", () => {
  assert.equal(decide({ tool_name: "Bash", tool_input: { command: "git push" } }), null);
  assert.equal(decide({ agent_type: "Explore", tool_name: "Write", tool_input: {} }), null);
});

test("the reviewers may run the read commands and the review gates", () => {
  for (const command of [
    "git diff main",
    "git diff main...HEAD -- apps/web",
    "git log --oneline main..HEAD",
    "git status --short",
    "git branch --show-current",
    "git -C apps/web diff main --stat",
    "cd apps/web && pnpm lint",
    "cd apps/web && pnpm typecheck 2>&1 | tail -20",
    "pnpm --filter @acme/web exec vitest run --project backend",
    "TRACE_LOG=1 pnpm exec vitest run features/invites/api/__tests__/invites.router.test.ts",
    "pnpm exec eve info",
    "pnpm exec tsc --noEmit",
    "grep -rn 'useEffect\\|useState' features/invites | head",
    "rg -n \"createMachine\" agent/lib > /dev/null; echo $?",
    "find features -name '*.test.ts' | wc -l",
  ]) {
    assert.equal(decide(reviewer(command)), null, command);
  }
});

test("the reviewers may not run a command that writes", () => {
  for (const command of [
    "git commit -am fix",
    "git push",
    "git checkout main",
    "git branch fix/x",
    "git stash",
    "git diff main --output=patch.diff",
    "git -c core.pager=sh diff",
    "pnpm lint --fix",
    "pnpm exec eslint --fix .",
    "pnpm exec vitest run -u",
    "pnpm exec tsc",
    "pnpm install",
    "echo x > file.ts",
    "cat a >> b",
    "git diff | tee out.txt",
    "sed -i '' 's/a/b/' file.ts",
    "awk '{print > \"f\"}' a",
    "find . -name '*.tmp' -delete",
    "find . -exec rm {} \;",
    "sort -o out.txt in.txt",
    "rm -rf features",
    "mv a b",
    "node -e \"require('fs').writeFileSync('x','')\"",
    "echo $(rm x)",
    "echo `rm x`",
    "git status; rm x",
    "git status && touch x",
  ]) {
    assert.match(decide(reviewer(command)) ?? "", /read-only/, command);
  }
});

test("the reviewers may not call a file-writing tool", () => {
  for (const tool of ["Edit", "Write", "MultiEdit", "NotebookEdit", "PowerShell"]) {
    assert.match(decide(reviewer("", tool, "jig:frontend-feature-reviewer")) ?? "", /read-only/, tool);
  }
});

test("the hook prints a deny decision for a blocked call", async () => {
  const { execFileSync } = await import("node:child_process");
  const out = execFileSync("node", [new URL("./reviewer-read-only.mjs", import.meta.url).pathname], {
    input: JSON.stringify(reviewer("git push")),
  }).toString();
  assert.equal(JSON.parse(out).hookSpecificOutput.permissionDecision, "deny");
  const quiet = execFileSync("node", [new URL("./reviewer-read-only.mjs", import.meta.url).pathname], {
    input: JSON.stringify(reviewer("git diff main")),
  }).toString();
  assert.equal(quiet, "");
});
