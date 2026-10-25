// docs/lint-gates.md §6.1 frontend-standards 50 and 54: every fetching
// segment needs its own loading.tsx and error.tsx. A page fetches when it
// calls `prefetch`, or holds an `await` whose argument is a call expression;
// `await params` has an identifier argument and does not count.
import fs from "node:fs";
import path from "node:path";

function isPrefetchCall(node) {
  const callee = node.callee;
  if (callee.type === "Identifier") return callee.name === "prefetch";
  if (callee.type === "MemberExpression" && !callee.computed) {
    return (
      callee.property.type === "Identifier" &&
      callee.property.name === "prefetch"
    );
  }
  return false;
}

/** @type {import("eslint").Rule.RuleModule} */
const segmentHasLoadingAndErrorRule = {
  meta: {
    type: "problem",
    docs: {
      description:
        "frontend-standards 50 and 54: every fetching segment needs loading.tsx and error.tsx.",
    },
    messages: {
      missingLoading:
        "frontend-standards 50: this fetching segment has no loading.tsx.",
      missingError:
        "frontend-standards 54: this fetching segment has no error.tsx.",
    },
    schema: [],
  },
  create(context) {
    let fetches = false;

    return {
      AwaitExpression(node) {
        if (node.argument && node.argument.type === "CallExpression") {
          fetches = true;
        }
      },
      CallExpression(node) {
        if (isPrefetchCall(node)) {
          fetches = true;
        }
      },
      "Program:exit"(node) {
        if (!fetches) return;
        const dir = path.dirname(context.filename);
        const hasLoading = fs.existsSync(path.join(dir, "loading.tsx"));
        const hasError = fs.existsSync(path.join(dir, "error.tsx"));
        if (!hasLoading) {
          context.report({ node, messageId: "missingLoading" });
        }
        if (!hasError) {
          context.report({ node, messageId: "missingError" });
        }
      },
    };
  },
};

export default segmentHasLoadingAndErrorRule;
