// Reports each node that one of the given selectors matches, with the
// message of that selector. oxlint has no native rule that takes a
// selector, so the jig gates use this one.

const restrictedSyntaxRule = {
  meta: {
    type: "problem",
    docs: { description: "Refuses the syntax that a selector names." },
    schema: {
      type: "array",
      items: {
        type: "object",
        properties: {
          selector: { type: "string" },
          message: { type: "string" },
        },
        required: ["selector", "message"],
        additionalProperties: false,
      },
    },
  },
  create(context) {
    const handlers = {};
    for (const { selector, message } of context.options) {
      handlers[selector] = (node) => context.report({ node, message });
    }
    return handlers;
  },
};

export default restrictedSyntaxRule;
