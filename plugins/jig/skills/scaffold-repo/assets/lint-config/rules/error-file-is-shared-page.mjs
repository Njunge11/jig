// frontend-standards 54: the app has one error page. Each `error.tsx` is one
// export of it, `global-error.tsx` draws it inside <html> and <body>, and the
// root layout has `error.tsx`, `global-error.tsx` and `not-found.tsx` beside it.
import fs from "node:fs";
import path from "node:path";

const SHARED = /(^|\/)route-error$/;
const APP_WIDE = ["error.tsx", "global-error.tsx", "not-found.tsx"];

function isSharedExport(statement) {
  return (
    statement.type === "ExportNamedDeclaration" &&
    statement.source &&
    SHARED.test(statement.source.value) &&
    statement.specifiers.length === 1 &&
    statement.specifiers[0].local.name === "RouteError" &&
    statement.specifiers[0].exported.name === "default"
  );
}

const errorFileIsSharedPageRule = {
  meta: {
    type: "problem",
    docs: {
      description: "frontend-standards 54: each error file is the shared error page.",
    },
    messages: {
      ownPage:
        'frontend-standards 54: an error file has no page of its own. Its one statement is `export { RouteError as default } from "@/components/ui/route-error";`.',
      ownMarkup:
        "frontend-standards 54: global-error.tsx draws only <html>, <body> and <RouteError>.",
      missing: "frontend-standards 54: the app has no app/{{name}}.",
    },
    schema: [],
  },
  create(context) {
    const file = path.basename(context.filename);
    if (file === "error.tsx") {
      return {
        "Program:exit"(node) {
          const statements = node.body.filter(
            (statement) => !statement.directive,
          );
          if (statements.length !== 1 || !isSharedExport(statements[0])) {
            context.report({ node, messageId: "ownPage" });
          }
        },
      };
    }
    if (file === "global-error.tsx") {
      return {
        JSXOpeningElement(node) {
          const name = node.name.type === "JSXIdentifier" ? node.name.name : "";
          if (!["html", "body", "RouteError"].includes(name)) {
            context.report({ node, messageId: "ownMarkup" });
          }
        },
      };
    }
    // The root layout.
    return {
      "Program:exit"(node) {
        const dir = path.dirname(context.filename);
        for (const name of APP_WIDE) {
          if (!fs.existsSync(path.join(dir, name))) {
            context.report({ node, messageId: "missing", data: { name } });
          }
        }
      },
    };
  },
};

export default errorFileIsSharedPageRule;
