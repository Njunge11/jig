// docs/lint-gates.md §6.1 backend-standards 5: a `"use workflow"` function
// must stay deterministic. Reports non-deterministic calls (new Date() with
// no argument, Date.now(), Math.random(), crypto.randomUUID(), fetch()) and
// imports of a service/repo layer or the db/orm/tRPC modules, wherever they
// sit inside a Program or a function whose own body starts with the
// directive.
//
// The directive can sit at Program level or on one function's own body (the
// repo's real workflows carry it on the function, e.g.
// app/workflows/job-posting/job-posting.workflow.ts:26-27). Either way the
// import clause reads the whole file: a workflow file's imports sit at
// module scope, above or below the function that carries the directive, so
// there is no per-import scope to walk the way there is for a call.

function bodyStartsWithUseWorkflow(statements) {
  if (!statements || statements.length === 0) return false;
  const first = statements[0];
  return (
    first.type === "ExpressionStatement" &&
    first.expression.type === "Literal" &&
    first.expression.value === "use workflow"
  );
}

function isFunctionNode(node) {
  return (
    node.type === "FunctionDeclaration" ||
    node.type === "FunctionExpression" ||
    node.type === "ArrowFunctionExpression"
  );
}

function inWorkflowScope(node) {
  let current = node;
  while (current) {
    if (current.type === "Program" && bodyStartsWithUseWorkflow(current.body)) {
      return true;
    }
    if (
      isFunctionNode(current) &&
      current.body.type === "BlockStatement" &&
      bodyStartsWithUseWorkflow(current.body.body)
    ) {
      return true;
    }
    current = current.parent;
  }
  return false;
}

const restrictedImportSources = new Set([
  "@ajiri/db/client",
  "drizzle-orm",
  "@trpc/server",
]);

function isRestrictedImportSource(source) {
  return (
    restrictedImportSources.has(source) ||
    source.endsWith(".service") ||
    source.endsWith(".repo") ||
    source.endsWith(".repository")
  );
}

// Generic ESTree walk: true if any function anywhere in the tree has a body
// that starts with the "use workflow" directive. `parent` is skipped so the
// walk never follows the back-edge ESLint sets while traversing.
function containsWorkflowFunction(node, seen) {
  if (!node || typeof node !== "object" || typeof node.type !== "string") {
    return false;
  }
  if (seen.has(node)) return false;
  seen.add(node);

  if (
    isFunctionNode(node) &&
    node.body.type === "BlockStatement" &&
    bodyStartsWithUseWorkflow(node.body.body)
  ) {
    return true;
  }

  for (const key of Object.keys(node)) {
    if (key === "parent") continue;
    const value = node[key];
    if (Array.isArray(value)) {
      for (const item of value) {
        if (containsWorkflowFunction(item, seen)) return true;
      }
    } else if (containsWorkflowFunction(value, seen)) {
      return true;
    }
  }
  return false;
}

function fileIsWorkflow(programNode) {
  return (
    bodyStartsWithUseWorkflow(programNode.body) ||
    containsWorkflowFunction(programNode, new Set())
  );
}

/** @type {import("eslint").Rule.RuleModule} */
const workflowDeterministicRule = {
  meta: {
    type: "problem",
    docs: {
      description:
        'backend-standards 5: a "use workflow" function must not do non-deterministic I/O.',
    },
    messages: {
      nonDeterministicCall:
        'backend-standards 5: "use workflow" function does non-deterministic I/O.',
      layerImport:
        'backend-standards 5: "use workflow" function imports a service/repo layer or db/orm module ({{source}}).',
    },
    schema: [],
  },
  create(context) {
    // Computed once, from the Program node, before any ImportDeclaration in
    // the file is visited (Program is entered first in document order).
    let workflowFile = false;

    return {
      Program(node) {
        workflowFile = fileIsWorkflow(node);
      },
      ImportDeclaration(node) {
        if (!workflowFile) return;
        const source = node.source.value;
        if (isRestrictedImportSource(source)) {
          context.report({ node, messageId: "layerImport", data: { source } });
        }
      },
      NewExpression(node) {
        if (
          node.callee.type === "Identifier" &&
          node.callee.name === "Date" &&
          node.arguments.length === 0 &&
          inWorkflowScope(node)
        ) {
          context.report({ node, messageId: "nonDeterministicCall" });
        }
      },
      CallExpression(node) {
        if (!inWorkflowScope(node)) return;
        const callee = node.callee;
        if (callee.type === "Identifier" && callee.name === "fetch") {
          context.report({ node, messageId: "nonDeterministicCall" });
          return;
        }
        if (callee.type === "MemberExpression" && !callee.computed) {
          const objectName =
            callee.object.type === "Identifier" ? callee.object.name : null;
          const propertyName =
            callee.property.type === "Identifier"
              ? callee.property.name
              : null;
          if (
            (objectName === "Date" && propertyName === "now") ||
            (objectName === "Math" && propertyName === "random") ||
            (objectName === "crypto" && propertyName === "randomUUID")
          ) {
            context.report({ node, messageId: "nonDeterministicCall" });
          }
        }
      },
    };
  },
};

export default workflowDeterministicRule;
