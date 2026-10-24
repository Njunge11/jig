// PreToolUse hook. Outside the two jig reviewer agents it does nothing.
// Inside them it denies every tool call that can write: any tool but Bash,
// and any Bash command that is not on the read-only allowlist below.
import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

const REVIEWER = /(^|:)(backend|frontend)-feature-reviewer$/;

const READ_TOOLS = new Set([
  "cat", "ls", "head", "tail", "wc", "grep", "rg", "find", "jq", "sort", "uniq", "cut", "tr", "diff", "echo", "printf", "pwd",
  "test", "true", "which", "cd", "basename", "dirname", "realpath",
]);
const GIT_READ = new Set([
  "diff", "log", "status", "show", "rev-parse", "ls-files", "merge-base",
  "blame", "grep", "ls-remote", "cat-file", "describe", "shortlog",
]);
const GATE_SCRIPTS = new Set(["lint", "typecheck", "test", "test:run"]);
const GATE_BINS = new Set(["vitest", "tsc", "eslint", "eve"]);

// Splits a command line into segments on unquoted ; && || | and newlines.
// Returns null when it finds an unquoted write redirect or a command
// substitution, which no segment check can see into.
export function segments(command) {
  const out = [];
  let cur = "";
  let quote = null;
  for (let i = 0; i < command.length; i++) {
    const c = command[i];
    const next = command[i + 1];
    if (quote === "'") {
      if (c === "'") quote = null;
      cur += c;
      continue;
    }
    if (c === "\\") {
      cur += c + (next ?? "");
      i++;
      continue;
    }
    if (c === "`" || (c === "$" && next === "(")) return null;
    if (quote === '"') {
      if (c === '"') quote = null;
      cur += c;
      continue;
    }
    if (c === "'" || c === '"') {
      quote = c;
      cur += c;
      continue;
    }
    if (c === ">") {
      const rest = command.slice(i + 1).trimStart();
      if (rest.startsWith("&1") || rest.startsWith("&2")) {
        cur += ">" + rest.slice(0, 2);
        i = command.indexOf("&", i) + 1;
        continue;
      }
      if (rest.startsWith("/dev/null")) {
        cur += ">/dev/null";
        i = command.indexOf("/dev/null", i) + "/dev/null".length - 1;
        continue;
      }
      return null;
    }
    if (c === ";" || c === "\n" || c === "|" || (c === "&" && next === "&")) {
      if (cur.trim()) out.push(cur.trim());
      cur = "";
      if ((c === "|" && next === "|") || (c === "&" && next === "&")) i++;
      continue;
    }
    cur += c;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}

function words(segment) {
  return (segment.match(/'[^']*'|"(?:\\.|[^"\\])*"|\S+/g) ?? []).map((w) =>
    w.replace(/^['"]|['"]$/g, ""),
  );
}

function gateAllowed(args) {
  const writes = ["--fix", "-u", "--update", "-o", "--output-file", "--outputFile", "--write"];
  if (args.some((a) => writes.some((w) => a === w || a.startsWith(w + "=") || a.startsWith("--fix")))) return false;
  const [bin, ...rest] = args;
  if (GATE_BINS.has(bin)) {
    if (bin === "tsc") return rest.includes("--noEmit");
    if (bin === "eve") return rest[0] === "info";
    return true;
  }
  if (bin === "pnpm" || bin === "npx") {
    let i = 0;
    while (rest[i] === "--filter" || rest[i] === "-F" || rest[i] === "-C" || rest[i] === "--dir") i += 2;
    const cmd = rest.slice(i);
    if (cmd[0] === "exec" || cmd[0] === "run") return cmd[0] === "run" ? GATE_SCRIPTS.has(cmd[1]) : gateAllowed(cmd.slice(1));
    if (GATE_SCRIPTS.has(cmd[0])) return true;
    return gateAllowed(cmd);
  }
  return false;
}

export function segmentAllowed(segment) {
  const args = words(segment);
  while (args.length && /^[A-Za-z_][A-Za-z0-9_]*=/.test(args[0])) args.shift();
  const [bin, ...rest] = args;
  if (!bin) return true;
  if (bin === "git") {
    let i = 0;
    while (rest[i] === "-C") i += 2;
    const sub = rest[i];
    const subArgs = rest.slice(i + 1);
    if (subArgs.some((a) => a.startsWith("--output") || a === "-O" || a.startsWith("--open-files-in-pager") || a === "--ext-diff")) return false;
    if (sub === "branch") return subArgs.length > 0 && subArgs.every((a) => ["--show-current", "-a", "-r", "--list", "-v", "-vv"].includes(a));
    return GIT_READ.has(sub);
  }
  if (READ_TOOLS.has(bin)) {
    if (bin === "find") return !rest.some((a) => ["-delete", "-exec", "-execdir", "-ok", "-okdir", "-fprint", "-fprint0", "-fprintf", "-fls"].includes(a));
    if (bin === "sort") return !rest.some((a) => a === "-o" || a.startsWith("--output"));
    if (bin === "rg") return !rest.some((a) => a === "--pre" || a.startsWith("--pre="));
    return true;
  }
  return gateAllowed(args);
}

export function decide(input) {
  if (!REVIEWER.test(input.agent_type ?? "")) return null;
  if (input.tool_name !== "Bash") return `the ${input.agent_type} agent is read-only: it may not call ${input.tool_name}.`;
  const command = input.tool_input?.command ?? "";
  const parts = segments(command);
  if (parts === null) return `the ${input.agent_type} agent is read-only: no output redirect to a file and no command substitution.`;
  const bad = parts.find((p) => !segmentAllowed(p));
  if (bad) return `the ${input.agent_type} agent is read-only: "${bad}" is not a read command or a review gate. Report the change as a fail line instead.`;
  return null;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  let reason = null;
  try {
    reason = decide(JSON.parse(readFileSync(0, "utf8")));
  } catch {
    reason = null;
  }
  if (reason) {
    process.stdout.write(JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "deny",
        permissionDecisionReason: reason,
      },
    }));
  }
}
