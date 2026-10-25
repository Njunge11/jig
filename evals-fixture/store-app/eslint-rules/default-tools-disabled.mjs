// docs/lint-gates.md §6.1 eve-agent 5: every default eve tool must be
// disabled. For each slug, agent/tools/<slug>.ts must exist and its text
// must contain `export default disableTool()`. One message per slug.
import fs from "node:fs";
import path from "node:path";

const DEFAULT_TOOL_SLUGS = [
  "agent",
  "ask_question",
  "bash",
  "read_file",
  "todo",
  "web_fetch",
  "web_search",
  "write_file",
];

/** @type {import("eslint").Rule.RuleModule} */
const defaultToolsDisabledRule = {
  meta: {
    type: "problem",
    docs: {
      description: "eve-agent 5: default built-in tool still enabled.",
    },
    messages: {
      notDisabled:
        "eve-agent 5: agent/tools/{{slug}}.ts must export default disableTool().",
    },
    schema: [],
  },
  create(context) {
    return {
      Program(node) {
        const agentDir = path.dirname(context.filename);
        for (const slug of DEFAULT_TOOL_SLUGS) {
          const toolPath = path.join(agentDir, "tools", `${slug}.ts`);
          let disabled = false;
          if (fs.existsSync(toolPath)) {
            const text = fs.readFileSync(toolPath, "utf8");
            disabled = text.includes("export default disableTool()");
          }
          if (!disabled) {
            context.report({ node, messageId: "notDisabled", data: { slug } });
          }
        }
      },
    };
  },
};

export default defaultToolsDisabledRule;
