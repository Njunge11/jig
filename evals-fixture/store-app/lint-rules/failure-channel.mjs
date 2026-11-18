// frontend-standards 56: one handler shows the toast of each failed mutation.
// A mutation names its failure in `meta`, and no other code calls `toast.error`.

function hasMeta(options) {
  return options.properties.some(
    (property) =>
      property.type === "SpreadElement" ||
      (property.key?.type === "Identifier" && property.key.name === "meta"),
  );
}

/** The options object of `x.mutationOptions(...)` or of `useMutation({...})`. */
function mutationOptionsOf(node) {
  const callee = node.callee;
  const first = node.arguments[0];
  if (
    callee.type === "MemberExpression" &&
    callee.property.type === "Identifier" &&
    callee.property.name === "mutationOptions"
  ) {
    return { found: true, options: first };
  }
  if (
    callee.type === "Identifier" &&
    callee.name === "useMutation" &&
    first?.type === "ObjectExpression"
  ) {
    return { found: true, options: first };
  }
  return { found: false };
}

const failureChannelRule = {
  meta: {
    type: "problem",
    docs: {
      description:
        "frontend-standards 56: the one handler shows a failed mutation.",
    },
    messages: {
      handToast:
        "frontend-standards 56: no `toast.error` by hand. The handler of the query client shows a failed mutation: give the mutation `meta: { failureTitle }`.",
      noMeta:
        "frontend-standards 56: this mutation has no `meta`. Write `meta: { failureTitle: \"Couldn't <do the action>\" }`, or `meta: { showsOwnFailure: true }` when it draws its failure itself.",
    },
    schema: [],
  },
  create(context) {
    return {
      CallExpression(node) {
        const callee = node.callee;
        if (
          callee.type === "MemberExpression" &&
          callee.object.type === "Identifier" &&
          callee.object.name === "toast" &&
          callee.property.type === "Identifier" &&
          callee.property.name === "error"
        ) {
          context.report({ node, messageId: "handToast" });
          return;
        }
        const { found, options } = mutationOptionsOf(node);
        if (!found) return;
        if (!options) {
          context.report({ node, messageId: "noMeta" });
          return;
        }
        if (options.type === "ObjectExpression" && !hasMeta(options)) {
          context.report({ node, messageId: "noMeta" });
        }
      },
    };
  },
};

export default failureChannelRule;
